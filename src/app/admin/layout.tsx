import type { Metadata } from "next";

// Admin is inherently per-request (session + fresh data): allow this
// segment to block instead of producing a static shell.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin · AVRANI", template: "%s · AVRANI Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-cream/50">{children}</div>;
}
