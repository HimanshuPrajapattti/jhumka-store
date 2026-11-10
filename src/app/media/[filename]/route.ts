import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUploadsDirectory } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

const FILE_NAME_PATTERN = /^[a-z0-9-]+\.(?:jpg|png|webp|avif|gif|svg)$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  if (!FILE_NAME_PATTERN.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(filename).slice(1).toLowerCase();
  try {
    const file = await readFile(path.join(getUploadsDirectory(), filename));
    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": TYPES[extension],
      "X-Content-Type-Options": "nosniff",
    });
    if (extension === "svg") {
      headers.set(
        "Content-Security-Policy",
        "default-src 'none'; style-src 'unsafe-inline'; sandbox;",
      );
    }
    return new Response(new Uint8Array(file), { headers });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
