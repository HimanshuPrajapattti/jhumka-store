/**
 * Smoke-tests the checkout domain logic and admin credential checks
 * against a throwaway database (never touches data/avrani.db).
 *
 * Run: npx tsx scripts/smoke-orders.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "avrani-smoke-"));
process.env.AVRANI_DB_PATH = path.join(tmpDir, "smoke.db");
process.env.ADMIN_EMAIL = "admin@avrani.in";
process.env.ADMIN_PASSWORD = "test-pass-123";
process.env.SESSION_SECRET = "smoke-secret";
process.env.WHATSAPP_NUMBER = "919256863315";

const { createOrderFromCart } = await import("../src/lib/orders.ts");
const { getDb } = await import("../src/lib/db.ts");
const { verifyCredentials } = await import("../src/lib/auth.ts");
const { businessLink } = await import("../src/lib/whatsapp.ts");

try {
  // ---- 1. DB creates + seeds ----
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as {
    n: number;
  };
  assert.equal(count.n, 8, `expected 8 seeded products, got ${count.n}`);

  // ---- 2. A valid order ----
  const p1 = db
    .prepare("SELECT id, stock, price, name FROM products WHERE id = 1")
    .get() as { id: number; stock: number; price: number; name: string };

  const created = createOrderFromCart({
    name: "Priya Sharma",
    phone: "98765 43210",
    address: "42 MG Road, Indore, MP 452001",
    note: "Gift wrap please",
    items: [{ id: p1.id, qty: 2 }],
  });

  assert.match(created.ref, /^AVR-[0-9A-F]{8}$/, `bad ref ${created.ref}`);
  assert.ok(
    created.message.includes("*New Order — AVRANI*"),
    "message missing header",
  );
  assert.ok(created.message.includes(`Ref: ${created.ref}`), "message missing ref");
  assert.ok(created.message.includes("Gift wrap please"), "message missing note");
  assert.ok(created.message.includes("Name: Priya Sharma"), "message missing name");
  assert.ok(created.message.includes("Address: 42 MG Road"), "message missing address");
  assert.equal(created.total, p1.price * 2, "total should be price × qty");

  const after = db
    .prepare("SELECT stock FROM products WHERE id = ?")
    .get(p1.id) as { stock: number };
  assert.equal(after.stock, p1.stock - 2, "stock should decrement by 2");

  const order = db
    .prepare("SELECT * FROM orders WHERE ref = ?")
    .get(created.ref) as {
    id: number;
    phone: string;
    total: number;
    status: string;
    message: string;
  };
  assert.ok(order, "order row should exist");
  assert.equal(order.phone, "919876543210", "phone normalised to 91…");
  assert.equal(order.total, p1.price * 2, "order total stored");
  assert.equal(order.status, "pending", "new orders start pending");
  assert.ok(order.message.includes(created.ref), "message persisted");

  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(order.id) as { qty: number; price: number; product_name: string }[];
  assert.equal(items.length, 1, "one order item");
  assert.equal(items[0].qty, 2, "item qty 2");
  assert.equal(items[0].price, p1.price, "item price snapshot from DB");
  assert.equal(items[0].product_name, p1.name, "item name snapshot");

  // ---- 3. Multi-item order maths ----
  const p2 = db
    .prepare("SELECT id, price FROM products WHERE id = 2")
    .get() as { id: number; price: number };
  const multi = createOrderFromCart({
    name: "Asha Verma",
    phone: "+91 99887 76655",
    address: "7 Park Street, Kolkata, WB 700016",
    items: [
      { id: p1.id, qty: 1 },
      { id: p2.id, qty: 3 },
    ],
  });
  assert.equal(multi.total, p1.price + p2.price * 3, "multi-item total");

  // ---- 4. Validation errors ----
  assert.throws(
    () => createOrderFromCart({ name: "X", phone: "9876543210", address: "long enough address", items: [{ id: 1, qty: 1 }] }),
    /full name/,
    "short name rejected",
  );
  assert.throws(
    () => createOrderFromCart({ name: "Valid Name", phone: "12", address: "long enough address", items: [{ id: 1, qty: 1 }] }),
    /valid 10-digit/,
    "bad phone rejected",
  );
  assert.throws(
    () => createOrderFromCart({ name: "Valid Name", phone: "9876543210", address: "short", items: [{ id: 1, qty: 1 }] }),
    /delivery address/,
    "short address rejected",
  );
  assert.throws(
    () => createOrderFromCart({ name: "Valid Name", phone: "9876543210", address: "long enough address", items: [] }),
    /empty/,
    "empty cart rejected",
  );
  assert.throws(
    () => createOrderFromCart({ name: "Valid Name", phone: "9876543210", address: "long enough address", items: [{ id: 99999, qty: 1 }] }),
    /no longer available/,
    "unknown product rejected",
  );

  // ---- 5. Stock guard ----
  const low = db
    .prepare("SELECT id, stock FROM products WHERE stock BETWEEN 1 AND 19 ORDER BY stock ASC LIMIT 1")
    .get() as { id: number; stock: number };
  assert.ok(low, "found a product with 1..19 stock");
  assert.throws(
    () => createOrderFromCart({ name: "Valid Name", phone: "9876543210", address: "long enough address", items: [{ id: low.id, qty: low.stock + 1 }] }),
    /Only \d+ left/,
    "overselling rejected",
  );

  // ---- 6. Admin credentials ----
  assert.equal(verifyCredentials("admin@avrani.in", "test-pass-123"), true, "good creds accepted");
  assert.equal(verifyCredentials("admin@avrani.in", "wrong"), false, "bad password rejected");
  assert.equal(verifyCredentials("someone@else.in", "test-pass-123"), false, "bad email rejected");

  // ---- 6b. Session tokens (dotted email regression guard) ----
  const { signToken, verifyToken, COOKIE_NAME } = await import(
    "../src/lib/session-token.ts"
  );
  assert.equal(COOKIE_NAME, "avrani_session", "cookie name stable");
  const fresh = signToken("admin@avrani.in");
  assert.equal(verifyToken(fresh), true, "fresh token accepted");
  assert.equal(
    verifyToken(fresh.slice(0, -4) + "0000"),
    false,
    "tampered signature rejected",
  );
  assert.equal(verifyToken("garbage"), false, "garbage rejected");
  assert.equal(verifyToken(undefined), false, "missing rejected");
  assert.equal(
    verifyToken(signToken("someone@else.in")),
    false,
    "token for another email rejected",
  );
  const realNow = Date.now;
  Date.now = () => realNow() + 8 * 24 * 60 * 60 * 1000; // past 7-day expiry
  try {
    assert.equal(verifyToken(fresh), false, "expired token rejected");
  } finally {
    Date.now = realNow;
  }

  // ---- 6c. WhatsApp business link ----
  assert.equal(
    businessLink("hello world"),
    "https://wa.me/919256863315?text=hello%20world",
    "businessLink builds a wa.me URL with encoded text",
  );

  console.log(
    "✅ smoke passed: orders, stock, validation, phone normalisation, credentials, session tokens, wa link",
  );
} finally {
  try {
    const { getDb } = await import("../src/lib/db.ts");
    getDb().close();
  } catch {
    /* already closed */
  }
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 3 });
}
