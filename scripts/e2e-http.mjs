/**
 * End-to-end HTTP tests against a running production server (`next start`).
 * Exercises the REAL server actions over the wire (MPA form posts, the same
 * encoding a browser sends when JS hasn't hydrated):
 *
 *   1. login action → 3xx + session cookie
 *   2. authenticated admin pages render (200, no error shell)
 *   3. placeOrder action → order row + stock decrement + no error state
 *   4. cleanup (deletes the test order, restores stock)
 *
 * Run (server must be up on :3000):  node scripts/e2e-http.mjs
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ORIGIN = new URL(BASE).origin;
const DB_PATH = process.env.AVRANI_DB_PATH
  ? path.resolve(process.env.AVRANI_DB_PATH)
  : path.join(process.cwd(), "data", "avrani.db");

let failures = 0;
const pass = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  console.log(`FAIL  ${m}`);
  failures++;
};

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Value of a hidden input by exact name (values are entity-escaped). */
function hiddenValue(html, name) {
  const idx = html.indexOf(`name="${name}"`);
  if (idx === -1) return null;
  const start = html.lastIndexOf("<input", idx);
  const end = html.indexOf(">", idx);
  const tag = html.slice(start, end + 1);
  const m = tag.match(/value="([^"]*)"/);
  return m ? decodeEntities(m[1]) : "";
}

/** Look up a server-action id from the build manifest. */
function actionId(filename, exportedName) {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(".next", "server", "server-reference-manifest.json"),
      "utf8",
    ),
  );
  const map = raw.node ?? raw;
  for (const [id, entry] of Object.entries(map)) {
    if (entry?.filename === filename && entry?.exportedName === exportedName) {
      return id;
    }
  }
  throw new Error(`action not found in manifest: ${filename}#${exportedName}`);
}

function buildActionForm(descriptor) {
  const fd = new FormData();
  fd.set("$ACTION_REF_1", "");
  fd.set("$ACTION_1:0", JSON.stringify(descriptor));
  fd.set("$ACTION_1:1", JSON.stringify([null]));
  return fd;
}

/* ------------------------------------------------------------------ */
/* 1. Login                                                            */
/* ------------------------------------------------------------------ */

const loginHtml = await (await fetch(`${BASE}/admin/login`)).text();
if (!loginHtml.includes("$ACTION_REF_1")) {
  fail("login page did not render progressive-enhancement action fields");
  process.exit(1);
}

const loginForm = new FormData();
for (const field of [
  "$ACTION_REF_1",
  "$ACTION_1:0",
  "$ACTION_1:1",
  "$ACTION_KEY",
]) {
  loginForm.set(field, hiddenValue(loginHtml, field) ?? "");
}
loginForm.set("email", "admin@avrani.in");
loginForm.set("password", "avrani-admin-2026");

const loginRes = await fetch(`${BASE}/admin/login`, {
  method: "POST",
  body: loginForm,
  redirect: "manual",
  headers: { Origin: ORIGIN },
});

const loginLoc = loginRes.headers.get("location") ?? "";
if ([301, 302, 303, 307, 308].includes(loginRes.status) && loginLoc.endsWith("/admin")) {
  pass(`login action -> ${loginRes.status} -> ${loginLoc}`);
} else {
  const body = await loginRes.text();
  fail(
    `login action -> ${loginRes.status} location=${loginLoc} body=${body.slice(0, 200)}`,
  );
}

const setCookies = loginRes.headers.getSetCookie?.() ?? [];
const sessionCookie = setCookies
  .filter((c) => c.startsWith("avrani_session="))
  .map((c) => c.split(";")[0]);
if (sessionCookie.length > 0) {
  pass(`login set avrani_session cookie (${sessionCookie[0].length} chars)`);
} else {
  fail(`login did not set avrani_session; set-cookie: ${setCookies.join(" | ") || "(none)"}`);
}

/* ------------------------------------------------------------------ */
/* 2. Authenticated admin pages                                        */
/* ------------------------------------------------------------------ */

const cookieHeader = sessionCookie.join("; ");
for (const [url, mustContain] of [
  ["/admin", "Dashboard"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
]) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { Cookie: cookieHeader },
  });
  const html = await res.text();
  if (res.status === 200 && html.includes(mustContain) && !html.includes("__next_error__")) {
    pass(`authed GET ${url} -> 200, "${mustContain}" present, no error shell`);
  } else {
    fail(
      `authed GET ${url} -> ${res.status} contains=${html.includes(mustContain)} errorShell=${html.includes("__next_error__")}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 3. Checkout (placeOrder)                                            */
/* ------------------------------------------------------------------ */

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const PRODUCT_ID = 1;
const before = db
  .prepare("SELECT stock, price, name FROM products WHERE id = ?")
  .get(PRODUCT_ID);
if (!before) {
  fail(`product ${PRODUCT_ID} missing from ${DB_PATH}`);
  process.exit(1);
}
const ordersBefore = db.prepare("SELECT COUNT(*) AS n FROM orders").get().n;

const placeOrderId = actionId("src/actions/checkout.ts", "placeOrder");
const loginKey = hiddenValue(loginHtml, "$ACTION_KEY");

// The checkout form is client-rendered (cart-gated), so we synthesise the
// same fields React would post, trying the plausible $ACTION_KEY variants.
const checkoutForm = buildActionForm({ id: placeOrderId, bound: "$@1" });
checkoutForm.set("$ACTION_KEY", loginKey ?? "");
checkoutForm.set("name", "Test Customer");
checkoutForm.set("phone", "98765 43210");
checkoutForm.set("address", "12 Test Street, Indore, MP 452001");
checkoutForm.set("note", "e2e test order");
checkoutForm.set("items", JSON.stringify([{ id: PRODUCT_ID, qty: 1 }]));

const orderRes = await fetch(`${BASE}/checkout`, {
  method: "POST",
  body: checkoutForm,
  redirect: "manual",
  headers: { Origin: ORIGIN },
});
const orderHtml = await orderRes.text();

const after = db
  .prepare("SELECT stock FROM products WHERE id = ?")
  .get(PRODUCT_ID);
const order = db
  .prepare(
    "SELECT * FROM orders WHERE customer_name = ? ORDER BY id DESC LIMIT 1",
  )
  .get("Test Customer");
const ordersAfter = db.prepare("SELECT COUNT(*) AS n FROM orders").get().n;

let orderOk = false;
if (orderRes.status !== 200) {
  fail(
    `placeOrder POST -> ${orderRes.status} (expected 200) body=${orderHtml.slice(0, 200)}`,
  );
} else if (!order) {
  fail("placeOrder: no order row created (action did not run or was rejected)");
} else if (orderHtml.includes("Something went wrong")) {
  fail(`placeOrder returned an error state: ${orderHtml.slice(0, 0)} (order row exists: id=${order.id})`);
} else if (after.stock !== before.stock - 1) {
  fail(`stock not decremented: before=${before.stock} after=${after.stock}`);
} else if (ordersAfter !== ordersBefore + 1) {
  fail(`orders count went ${ordersBefore} -> ${ordersAfter}`);
} else if (
  order.subtotal !== before.price ||
  order.total !== before.price ||
  order.status !== "pending" ||
  !order.message ||
  // normalised: country code 91 + national number
  order.phone !== "919876543210"
) {
  fail(
    `order fields wrong: subtotal=${order.subtotal} total=${order.total} price=${before.price} status=${order.status} phone=${order.phone} messageLen=${order.message?.length}`,
  );
} else {
  orderOk = true;
}

if (orderOk) {
  const item = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .get(order.id);
  if (
    item &&
    item.qty === 1 &&
    item.price === before.price &&
    item.product_name === before.name
  ) {
    pass(
      `placeOrder -> order ${order.ref} saved, stock ${before.stock}→${after.stock}, item line ok, no error state`,
    );
  } else {
    fail(`order_items wrong: ${JSON.stringify(item)}`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Cleanup                                                          */
/* ------------------------------------------------------------------ */

if (order) {
  db.prepare("DELETE FROM orders WHERE id = ?").run(order.id);
  db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
    before.stock,
    PRODUCT_ID,
  );
  const restored = db
    .prepare("SELECT stock FROM products WHERE id = ?")
    .get(PRODUCT_ID);
  const left = db
    .prepare("SELECT COUNT(*) AS n FROM orders WHERE customer_name = ?")
    .get("Test Customer").n;
  if (restored.stock === before.stock && left === 0) {
    pass("cleanup: test order removed, stock restored");
  } else {
    fail(`cleanup incomplete: stock=${restored.stock} leftoverOrders=${left}`);
  }
}
db.close();

console.log("----");
if (failures === 0) {
  console.log("E2E: ALL PASS");
} else {
  console.log(`E2E: ${failures} FAILURES`);
  process.exit(1);
}
