import "server-only";

import { createAdminClient } from "@insforge/sdk";

let client: ReturnType<typeof createAdminClient> | undefined;

export function getInsforgeAdmin() {
  if (client) return client;

  const baseUrl = process.env.INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "InsForge is not configured. Set INSFORGE_URL and INSFORGE_API_KEY.",
    );
  }

  client = createAdminClient({ baseUrl, apiKey });
  return client;
}

export function throwInsforgeError(error: { message: string } | null): void {
  if (error) throw new Error(`InsForge request failed: ${error.message}`);
}
