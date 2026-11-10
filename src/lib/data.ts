import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getInsforgeAdmin, throwInsforgeError } from "./insforge-admin";
import { parseProductImages } from "./product-images";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  imageKeys: (string | null)[];
  stock: number;
  featured: boolean;
};

export type ProductRecord = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: unknown;
  stock: number;
  featured: boolean;
  created_at: string;
};

export function toProduct(row: ProductRecord): Product {
  const assets = parseProductImages(row.images);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    images: assets.map((asset) => asset.url),
    imageKeys: assets.map((asset) => asset.key),
    stock: row.stock,
    featured: row.featured,
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

  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("id, slug, name, description, price, category, images, stock, featured, created_at")
    .eq("featured", true)
    .order("id", { ascending: false })
    .limit(100);
  throwInsforgeError(error);
  const rows = (data ?? []) as ProductRecord[];
  return rows.map(toProduct);
}

export async function getShopProducts(
  category?: string,
  q?: string,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  let query = getInsforgeAdmin()
    .database.from("products")
    .select("id, slug, name, description, price, category, images, stock, featured, created_at");
  if (category) query = query.eq("category", category);
  if (q) {
    const escaped = q.replace(/[(),]/g, " ");
    query = query.or(
      `name.ilike.%${escaped}%,description.ilike.%${escaped}%,category.ilike.%${escaped}%`,
    );
  }
  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("id", { ascending: false })
    .limit(200);
  throwInsforgeError(error);
  const rows = (data ?? []) as ProductRecord[];
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("id, slug, name, description, price, category, images, stock, featured, created_at")
    .eq("slug", slug)
    .maybeSingle();
  throwInsforgeError(error);
  const row = data as ProductRecord | null;
  return row ? toProduct(row) : null;
}

export async function getCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("category")
    .order("category")
    .limit(200);
  throwInsforgeError(error);
  return [...new Set((data ?? []).map((row) => row.category as string))];
}

export async function getAllSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { data, error } = await getInsforgeAdmin()
    .database.from("products")
    .select("slug")
    .order("slug")
    .limit(1000);
  throwInsforgeError(error);
  return (data ?? []).map((row) => row.slug as string);
}
