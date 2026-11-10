import crypto from "node:crypto";
import { getDb } from "./db";
import { buildOrderMessage } from "./whatsapp";

/**
 * Domain logic for creating an order. Framework-free on purpose so it can be
 * smoke-tested directly (scripts/smoke-orders.ts).
 *
 * Prices and stock are ALWAYS read from the database — never trusted from
 * the client.
 */

export type CheckoutLine = { id: number; qty: number };

export type CheckoutInput = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  items: CheckoutLine[];
};

export type CreatedOrder = {
  ref: string;
  message: string;
  total: number;
};

function makeRef(): string {
  return `AVR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 12) return `91${digits.slice(1)}`;
  return digits;
}

/** Throws Error with a customer-friendly message when the order is invalid. */
export function createOrderFromCart(input: CheckoutInput): CreatedOrder {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Please enter your full name.");

  const phone = normalizePhone(input.phone);
  if (phone.length < 10 || phone.length > 15 || !/^\d+$/.test(phone)) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  const address = input.address.trim();
  if (address.length < 10) {
    throw new Error("Please enter your full delivery address.");
  }

  const items = (input.items ?? []).filter(
    (i) =>
      Number.isInteger(i.id) &&
      i.id > 0 &&
      Number.isInteger(i.qty) &&
      i.qty > 0 &&
      i.qty <= 20,
  );
  if (items.length === 0) {
    throw new Error("Your cart looks empty. Please add some pieces first.");
  }

  const db = getDb();

  try {
    return db.transaction(() => {
      const productStmt = db.prepare(
        "SELECT id, name, price, stock FROM products WHERE id = ?",
      );

      const lines: { id: number; name: string; price: number; qty: number }[] = [];

      for (const item of items) {
        const product = productStmt.get(item.id) as
          | { id: number; name: string; price: number; stock: number }
          | undefined;

        if (!product) {
          throw new Error("A piece in your cart is no longer available.");
        }
        if (product.stock < item.qty) {
          throw new Error(`Only ${product.stock} left of "${product.name}".`);
        }
        lines.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: item.qty,
        });
      }

      const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      const ref = makeRef();

      db.prepare(
        `INSERT INTO orders (ref, customer_name, phone, address, note, subtotal, total, status, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', '')`,
      ).run(ref, name, phone, address, input.note?.trim() ?? "", total, total);

      const order = db.prepare("SELECT id FROM orders WHERE ref = ?").get(ref) as {
        id: number;
      };

      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty)
         VALUES (?, ?, ?, ?, ?)`,
      );
      const decStock = db.prepare(
        "UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?",
      );

      for (const line of lines) {
        insertItem.run(order.id, line.id, line.name, line.price, line.qty);
        decStock.run(line.qty, line.id);
      }

      const message = buildOrderMessage({
        ref,
        customerName: name,
        phone,
        address,
        note: input.note ?? "",
        items: lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty })),
        total,
      });

      db.prepare("UPDATE orders SET message = ? WHERE id = ?").run(
        message,
        order.id,
      );

      return { ref, message, total };
    })();
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Please")) throw err;
    if (err instanceof Error && err.message.startsWith("Only")) throw err;
    if (err instanceof Error && err.message.startsWith("Your cart")) throw err;
    if (err instanceof Error && err.message.startsWith("A piece")) throw err;
    throw new Error("Something went wrong while saving your order. Please try again.");
  }
}
