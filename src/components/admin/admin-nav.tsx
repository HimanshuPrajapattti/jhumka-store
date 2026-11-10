"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/admin";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "chart" },
  { href: "/admin/products", label: "Products", icon: "gem" },
  { href: "/admin/orders", label: "Orders", icon: "bag" },
  { href: "/admin/appearance", label: "Appearance", icon: "sparkle" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "chart")
    return (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    );
  if (name === "gem")
    return (
      <svg {...common}>
        <path d="M6 3h12l3 6-9 12L3 9l3-6zM3 9h18M9 3l-3 6 6 12 6-12-3-6" />
      </svg>
    );
  if (name === "sparkle")
    return (
      <svg {...common}>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 016 0" />
    </svg>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-maroon-deep px-5 py-7 md:flex">
        <Link href="/" className="font-display text-2xl font-semibold tracking-[0.35em] text-gold">
          AVRANI
        </Link>
        <p className="label-caps mt-1 text-cream/50">Studio admin</p>

        <nav className="mt-9 flex-1 space-y-1.5">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`label-caps flex items-center gap-3 rounded-xl px-4 py-3.5 transition ${
                  active
                    ? "bg-gold text-maroon-deep shadow-[0_10px_24px_-14px_rgba(195,160,90,0.9)]"
                    : "text-cream/75 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="label-caps flex w-full items-center gap-3 rounded-xl border border-cream/20 px-4 py-3.5 text-cream/70 transition hover:border-cream/50 hover:text-cream"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 bg-maroon-deep px-5 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold tracking-[0.3em] text-gold">
            AVRANI
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="label-caps rounded-full border border-cream/25 px-4 py-2 text-cream/80"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`label-caps shrink-0 rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-gold text-maroon-deep"
                    : "border border-cream/20 text-cream/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
