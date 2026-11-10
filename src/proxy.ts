import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/session-token";

/**
 * Optimistic auth gate for /admin — redirects to the login page with a real
 * 307 before any rendering happens. Per the Next docs this is a *permission
 * check only*; real authorization still happens in `requireAdmin()` (pages)
 * and `requireAdminAction()` (mutations), which re-verify the session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authed = verifyToken(token);

  // Already signed in? Skip the login page.
  if (authed && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Not signed in anywhere under /admin (except the login page itself).
  if (!authed && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
