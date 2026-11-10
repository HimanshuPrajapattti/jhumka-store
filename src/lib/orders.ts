import crypto from "node:crypto";
import { getDb } from "./db";
import { buildOrderMessage } from "./whatsapp";
import {
  normalizePhone,
  validateCheckoutInput,
  type CheckoutInput,
  type CreatedOrder,
} from "./checkout-input";

export { normalizePhone };
export type { CheckoutInput, CheckoutLine, CreatedOrder } from "./checkout-input";

/**
 * Domain logic for creating an order. Framework-free on purpose so it can be
 * smoke-tested directly (scripts/smoke-orders.ts).
 *
 * Prices and stock are ALWAYS read from the database — never trusted from
 * the client.
 */

function makeRef(): string {
  return `AVR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/** Throws Error with a customer-friendly message when the order is invalid. */
export function createOrderFromCart(input: CheckoutInput): CreatedOrder {
  const { name, phone, address, note, items } = validateCheckoutInput(input);

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
      ).run(ref, name, phone, address,       note, total, total);

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
        note,
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
