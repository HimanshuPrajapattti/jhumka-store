import type { ReactNode } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Reads the session (cookies) and renders the authenticated admin chrome.
 *
 * This must sit inside a <Suspense> boundary in the layout: with Cache
 * Components, a top-level cookie read in a layout can't be part of the
 * static shell, so the shell renders the skeleton and this streams in
 * behind it (redirecting to /admin/login when unauthenticated — the
 * proxy normally pre-empts that with a real 307).
 */
export async function AdminGuard({ children }: { children: ReactNode }) {
  // Token expiry checks use Date.now(); declare this subtree request-time
  // so the PPR resume doesn't flag it as an unstable prerender value.
  await connection();
  await requireAdmin();

  return (
    <div className="flex min-h-screen w-full">
      <AdminNav />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="px-5 py-7 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
