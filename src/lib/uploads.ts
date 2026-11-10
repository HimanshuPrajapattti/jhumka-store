import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PRODUCT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const APPEARANCE_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const UPLOAD_NAME_PATTERN = /^[a-z0-9-]+\.(?:jpg|png|webp|avif|gif|svg)$/i;

export function getUploadsDirectory(): string {
  return process.env.AVRANI_UPLOADS_DIR
    ? path.resolve(process.env.AVRANI_UPLOADS_DIR)
    : path.join(process.cwd(), "public", "uploads");
}

export async function saveUploads(
  files: File[],
  allowedTypes: Readonly<Record<string, string>> = PRODUCT_IMAGE_TYPES,
): Promise<string[]> {
  for (const file of files) {
    if (file.size === 0) continue;
    if (!allowedTypes[file.type]) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`"${file.name}" is larger than 6MB.`);
    }
  }

  const uploadsDir = getUploadsDirectory();
  await fs.mkdir(uploadsDir, { recursive: true });

  const saved: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;

    const ext = allowedTypes[file.type];
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, name), buffer, { flag: "wx" });
    saved.push(`/media/${name}`);
  }
  return saved;
}

export async function deleteUpload(url: string): Promise<void> {
  const filename = url.startsWith("/media/")
    ? url.slice("/media/".length)
    : url.startsWith("/uploads/")
      ? url.slice("/uploads/".length)
      : "";
  if (!UPLOAD_NAME_PATTERN.test(filename)) return;

  try {
    await fs.unlink(path.join(getUploadsDirectory(), filename));
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}
