import "server-only";

import crypto from "node:crypto";
import { getInsforgeAdmin, throwInsforgeError } from "./insforge-admin";

export type StoredImage = {
  url: string;
  key: string;
};

const PRODUCT_IMAGE_TYPES: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const APPEARANCE_IMAGE_TYPES: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const BUCKET = "avrani-media";

export async function uploadImages(
  files: File[],
  prefix: "products" | "appearance",
): Promise<StoredImage[]> {
  const allowedTypes =
    prefix === "appearance" ? APPEARANCE_IMAGE_TYPES : PRODUCT_IMAGE_TYPES;
  for (const file of files) {
    if (file.size === 0) continue;
    if (!allowedTypes[file.type]) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`"${file.name}" is larger than 6MB.`);
    }
  }

  const bucket = getInsforgeAdmin().storage.from(BUCKET);
  const uploaded: StoredImage[] = [];
  try {
    for (const file of files) {
      if (file.size === 0) continue;
      const extension = allowedTypes[file.type];
      const key = `${prefix}/${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
      const { data, error } = await bucket.upload(key, file);
      throwInsforgeError(error);
      if (!data?.url || !data.key) {
        throw new Error("InsForge did not return the uploaded image details.");
      }
      uploaded.push({ url: data.url, key: data.key });
    }
    return uploaded;
  } catch (error) {
    await deleteStoredImages(uploaded.map((image) => image.key));
    throw error;
  }
}

export async function deleteStoredImages(keys: string[]): Promise<void> {
  const safeKeys = keys.filter(
    (key) =>
      key.startsWith("products/") ||
      key.startsWith("appearance/") ||
      key.startsWith("legacy/"),
  );
  if (safeKeys.length === 0) return;

  const { error } = await getInsforgeAdmin()
    .storage.from(BUCKET)
    .remove(safeKeys);
  throwInsforgeError(error);
}
