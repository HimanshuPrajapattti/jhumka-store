import { Suspense } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";

function AdminShellSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse">
      {/* Sidebar skeleton */}
      <div className="hidden w-60 shrink-0 flex-col gap-4 bg-maroon-deep px-5 py-7 md:flex">
        <div className="h-8 w-32 rounded bg-cream/20" />
        <div className="mt-6 space-y-3">
          <div className="h-10 rounded-xl bg-cream/15" />
          <div className="h-10 rounded-xl bg-cream/15" />
          <div className="h-10 rounded-xl bg-cream/15" />
          <div className="h-10 rounded-xl bg-cream/15" />
        </div>
      </div>
      {/* Mobile bar + content skeleton */}
      <div className="flex-1">
        <div className="h-24 bg-maroon-deep md:hidden" />
        <div className="space-y-6 px-5 py-8 md:px-10">
          <div className="h-9 w-52 rounded bg-sand" />
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-sand" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-sand" />
        </div>
      </div>
    </div>
  );
}

/**
 * The session read lives inside <AdminGuard>, which must sit behind a
 * <Suspense> boundary: with Cache Components the static shell can't contain
 * a cookie read, so the shell renders this skeleton and the authenticated
 * chrome (nav + page content) streams in. The proxy.ts gate handles the
 * unauthenticated case with a real 307 before rendering even starts.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
