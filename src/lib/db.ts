import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ORDER_STATUSES, type OrderStatus } from "./order-statuses";

// Re-exported so server modules can keep importing from this file.
export { ORDER_STATUSES, type OrderStatus };

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string; // JSON array of image paths
  stock: number;
  featured: number;
  created_at: string;
};

export type OrderRow = {
  id: number;
  ref: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  message: string;
  created_at: string;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  qty: number;
};

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.AVRANI_DB_PATH
  ? path.resolve(process.env.AVRANI_DB_PATH)
  : path.join(DB_DIR, "avrani.db");

let _db: Database.Database | null = null;

function seed(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as {
    n: number;
  };
  if (count.n > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (slug, name, description, price, category, images, stock, featured)
    VALUES (@slug, @name, @description, @price, @category, @images, @stock, @featured)
  `);

  const products = [
    {
      slug: "royal-meenakari-jhumka",
      name: "Royal Meenakari Jhumka",
      description:
        "A regal pair of hand-painted meenakari jhumkas in deep maroon and antique gold. Lightweight enamel work over a brass base, finished with a fringe of tiny ghungroo beads that sway with every turn.",
      price: 1899,
      category: "Jhumka",
      stock: 12,
      featured: 1,
    },
    {
      slug: "antique-temple-jhumka",
      name: "Antique Temple Jhumka",
      description:
        "Inspired by South Indian temple jewellery, this oxidised brass jhumka carries lakshmi motifs and ruby-red stone accents. A statement piece for weddings and festive evenings.",
      price: 1499,
      category: "Temple",
      stock: 8,
      featured: 0,
    },
    {
      slug: "pearl-cascade-jhumka",
      name: "Pearl Cascade Jhumka",
      description:
        "Cascading freshwater-look pearls drop from a kundan-set dome, catching the light as you move. Delicate, romantic, and effortlessly elegant.",
      price: 1299,
      category: "Pearl",
      stock: 15,
      featured: 1,
    },
    {
      slug: "kundan-chandbali-drops",
      name: "Kundan Chandbali Drops",
      description:
        "Classic chandbali crescents layered with kundan work and pearl droplets. Hooks sit softly on the ear, making these easy to wear from ceremony to sangeet.",
      price: 1699,
      category: "Chandbali",
      stock: 10,
      featured: 0,
    },
    {
      slug: "oxidised-silver-jhumka",
      name: "Oxidised Silver Jhumka",
      description:
        "Everyday oxidised silver jhumkas with an antique finish and filigree dome. Pair with kurtas, sarees, or your favourite denim.",
      price: 899,
      category: "Jhumka",
      stock: 20,
      featured: 0,
    },
    {
      slug: "gold-plated-stud-jhumka",
      name: "Gold-Plated Stud Jhumkas",
      description:
        "A modern twist — a sleek gold-plated stud on top with a miniature jhumka drop below. Minimal, shiny, and made for daily wear.",
      price: 649,
      category: "Studs",
      stock: 25,
      featured: 0,
    },
    {
      slug: "mogra-pair-jhumka",
      name: "Mogra Pair Jhumka",
      description:
        "Clustered mogra-inspired pearls wrapped around a golden dome. Bridesmaid favourite — soft, floral, and photogenic from every angle.",
      price: 1199,
      category: "Jhumka",
      stock: 14,
      featured: 1,
    },
    {
      slug: "emerald-honesty-jhumka",
      name: "Emerald Honesty Jhumka",
      description:
        "Our most coveted piece — hand-set emerald-green stones in a grand jhumka silhouette with gold-plated detailing. Limited pairs, made to order.",
      price: 2199,
      category: "Jhumka",
      stock: 5,
      featured: 0,
    },
  ];

  const imageFor: Record<string, string> = {
    Jhumka: "/products/jhumka-gold.svg",
    Temple: "/products/jhumka-maroon.svg",
    Pearl: "/products/jhumka-pearl.svg",
    Chandbali: "/products/jhumka-emerald.svg",
    Studs: "/products/jhumka-rose.svg",
  };

  const tx = db.transaction(() => {
    for (const p of products) {
      const images = [imageFor[p.category] ?? "/products/jhumka-gold.svg"];
      insert.run({ ...p, images: JSON.stringify(images) });
    }
  });
  tx();
}

export function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       INTEGER NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Jhumka',
      images      TEXT NOT NULL DEFAULT '[]',
      stock       INTEGER NOT NULL DEFAULT 0,
      featured    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ref           TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone         TEXT NOT NULL,
      address       TEXT NOT NULL,
      note          TEXT NOT NULL DEFAULT '',
      subtotal      INTEGER NOT NULL DEFAULT 0,
      total         INTEGER NOT NULL DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'pending',
      message       TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      price        INTEGER NOT NULL,
      qty          INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);

  seed(db);

  _db = db;
  return db;
}

/** Parse the JSON images column into an array of paths. */
export function parseImages(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
