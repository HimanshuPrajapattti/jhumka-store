/**
 * Mints a valid admin session token using the app's own signer — handy for
 * manual curl testing of the authenticated admin panel:
 *
 *   npx tsx scripts/mint-session.mts
 *   curl -H "Cookie: avrani_session=<token>" http://localhost:3000/admin
 */
import fs from "node:fs";
import path from "node:path";

// Load .env.local like Next does (only if not already set).
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const { signToken, COOKIE_NAME } = await import("../src/lib/session-token.ts");

const email = process.env.ADMIN_EMAIL;
if (!email) throw new Error("ADMIN_EMAIL not set");

process.stdout.write(`${COOKIE_NAME}=${signToken(email)}\n`);
