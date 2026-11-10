import { cacheLife, cacheTag } from "next/cache";
import { getDb, parseImages, type ProductRow } from "./db";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    images: parseImages(row.images),
    stock: row.stock,
    featured: row.featured === 1,
  };
}

/**
 * Catalog reads are cached ("use cache") so they ship in the static shell.
 * Admin mutations call updateTag("products") which expires every entry below.
 */

export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = getDb()
    .prepare("SELECT * FROM products WHERE featured = 1 ORDER BY id DESC")
    .all() as ProductRow[];
  return rows.map(toProduct);
}

export async function getShopProducts(
  category?: string,
  q?: string,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const db = getDb();
  let sql = "SELECT * FROM products WHERE 1=1";
  const params: (string | number)[] = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += " ORDER BY featured DESC, id DESC";

  const rows = db.prepare(sql).all(...params) as ProductRow[];
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const row = getDb()
    .prepare("SELECT * FROM products WHERE slug = ?")
    .get(slug) as ProductRow | undefined;
  return row ? toProduct(row) : null;
}

export async function getCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = getDb()
    .prepare("SELECT DISTINCT category FROM products ORDER BY category")
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

export async function getAllSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = getDb()
    .prepare("SELECT slug FROM products")
    .all() as { slug: string }[];
  return rows.map((r) => r.slug);
}
