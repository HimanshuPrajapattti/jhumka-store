import { createAdminClient } from "@insforge/sdk";
import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const sourcePath = process.env.AVRANI_DB_PATH
  ? path.resolve(process.env.AVRANI_DB_PATH)
  : path.join(process.cwd(), "data", "avrani.db");
const uploadsDirectory = process.env.AVRANI_UPLOADS_DIR
  ? path.resolve(process.env.AVRANI_UPLOADS_DIR)
  : path.join(process.cwd(), "public", "uploads");
const baseUrl = process.env.INSFORGE_URL;
const apiKey = process.env.INSFORGE_API_KEY;

if (!baseUrl || !apiKey) {
  throw new Error("Set INSFORGE_URL and INSFORGE_API_KEY before migrating.");
}
if (!(await fs.stat(sourcePath).catch(() => null))) {
  throw new Error(`SQLite product database not found at ${sourcePath}.`);
}

type LocalProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string;
  stock: number;
  featured: number;
  created_at: string;
};

type ProductImage = { url: string; key: string | null };
type UploadedImage = { url: string; key: string };

const imageTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const sqlite = new Database(sourcePath, { readonly: true });
const rows = sqlite
  .prepare(
    `SELECT id, slug, name, description, price, category, images, stock,
            featured, created_at
     FROM products
     ORDER BY id`,
  )
  .all() as LocalProduct[];
sqlite.close();

const client = createAdminClient({ baseUrl, apiKey });
const bucket = client.storage.from("avrani-media");
const uploadedKeys: string[] = [];

async function uploadLocalImage(url: string, productId: number): Promise<UploadedImage | null> {
  const match = /^\/(?:media|uploads)\/([a-z0-9-]+\.(?:jpg|jpeg|png|webp|avif|gif|svg))$/i.exec(url);
  if (!match) return null;

  const filePath = path.join(uploadsDirectory, match[1]);
  const bytes = await fs.readFile(filePath);
  const mimeType = imageTypes[path.extname(match[1]).toLowerCase()];
  const key = `products/${productId}-${crypto.randomUUID()}${path.extname(match[1]).toLowerCase()}`;
  const { data, error } = await bucket.upload(key, new Blob([bytes], { type: mimeType }));
  if (error) throw new Error(`Could not upload a product image: ${error.message}`);
  if (!data?.url || !data.key) {
    throw new Error("InsForge did not return the uploaded image details.");
  }
  uploadedKeys.push(data.key);
  return { url: data.url, key: data.key };
}

try {
  const records = await Promise.all(
    rows.map(async (row) => {
      let existingImages: unknown;
      try {
        existingImages = JSON.parse(row.images);
      } catch {
        throw new Error(`Product ${row.id} has invalid image data.`);
      }
      if (!Array.isArray(existingImages)) {
        throw new Error(`Product ${row.id} has invalid image data.`);
      }

      const images: ProductImage[] = [];
      for (const item of existingImages) {
        if (typeof item !== "string") continue;
        const uploaded = await uploadLocalImage(item, row.id);
        images.push(uploaded ?? { url: item, key: null });
      }
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        images,
        stock: row.stock,
        featured: Boolean(row.featured),
        created_at: row.created_at,
      };
    }),
  );

  if (records.length > 0) {
    const { error } = await client.database.from("products").upsert(records);
    if (error) throw new Error(`Could not migrate product records: ${error.message}`);
  }

  const { error: sequenceError } = await client.database.rpc(
    "sync_product_id_sequence",
    {},
  );
  if (sequenceError) {
    throw new Error(`Could not synchronize product IDs: ${sequenceError.message}`);
  }
  console.log(`Migrated ${records.length} products and ${uploadedKeys.length} product images. Orders and customer details were not read or migrated.`);
} catch (error) {
  if (uploadedKeys.length > 0) {
    const { error: cleanupError } = await bucket.remove(uploadedKeys);
    if (cleanupError) {
      console.error(`Could not clean up incomplete migration uploads: ${cleanupError.message}`);
    }
  }
  throw error;
}
