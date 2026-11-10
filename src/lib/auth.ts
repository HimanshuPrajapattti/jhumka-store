import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  SESSION_DAYS,
  signToken,
  verifyToken,
} from "./session-token";

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  if (expectedEmail.length === 0 || expectedPassword.length === 0) {
    return false;
  }

  const emailOk = crypto.timingSafeEqual(
    Buffer.from(email.padEnd(64).slice(0, 64)),
    Buffer.from(expectedEmail.padEnd(64).slice(0, 64)),
  );
  const passOk = crypto.timingSafeEqual(
    Buffer.from(password.padEnd(64).slice(0, 64)),
    Buffer.from(expectedPassword.padEnd(64).slice(0, 64)),
  );
  return emailOk && passOk;
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, signToken(process.env.ADMIN_EMAIL || ""), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/**
 * Guard for admin pages — redirects to login when the session is
 * missing/invalid. Must be called from inside a <Suspense> boundary
 * (see the admin guard component), since it reads cookies().
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Guard for admin server actions — throws instead of redirecting. */
export async function requireAdminAction(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authenticated");
}
