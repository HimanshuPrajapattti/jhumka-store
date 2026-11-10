import crypto from "node:crypto";

/**
 * Pure session-token helpers (no Next.js imports) so both the proxy and the
 * server-side auth helpers can share them. Token format:
 *
 *   "<expiryMillis>.<email>.<hmac(expiryMillis.email)>"
 *
 * The email may itself contain dots (admin@avrani.in), so it must be parsed
 * with first/last-dot slicing — never token.split(".").
 */

export const COOKIE_NAME = "avrani_session";
export const SESSION_DAYS = 7;

function secret(): string {
  return process.env.SESSION_SECRET || "avrani-dev-secret";
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function signToken(email: string): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${expires}.${email}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;

  // First dot ends the numeric expiry, last dot starts the hex signature;
  // everything between is the email (which may contain dots).
  const firstDot = token.indexOf(".");
  const lastDot = token.lastIndexOf(".");
  if (firstDot < 0 || lastDot <= firstDot) return false;

  const expires = token.slice(0, firstDot);
  const email = token.slice(firstDot + 1, lastDot);
  const signature = token.slice(lastDot + 1);
  const payload = `${expires}.${email}`;

  const expected = Buffer.from(hmac(payload), "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length) return false;
  if (!crypto.timingSafeEqual(expected, received)) return false;

  const expiry = Number(expires);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return email === (process.env.ADMIN_EMAIL || "");
}
