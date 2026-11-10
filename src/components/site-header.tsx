"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useCart } from "@/components/cart";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      {/* Static announcement — no URL data, ships in the shell */}
      <div className="bg-maroon-deep px-4 py-2 text-center">
        <p className="label-caps text-cream/85">
          Free shipping across India
          <span className="mx-3 text-gold">✦</span>
          COD available
          <span className="mx-3 text-gold">✦</span>
          Custom orders on WhatsApp
        </p>
      </div>

      {/* Interactive bar reads usePathname/useCart — streams when the
          destination URL isn't known at build time. */}
      <Suspense fallback={<HeaderBarSkeleton />}>
        <HeaderBar />
      </Suspense>
    </header>
  );
}

function HeaderBarSkeleton() {
  return (
    <div className="border-b border-gold/25 bg-ivory/92">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20">
        <div className="h-8 w-40 animate-pulse rounded bg-sand" />
        <div className="hidden gap-6 md:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-14 animate-pulse rounded bg-sand" />
          ))}
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-sand" />
      </div>
    </div>
  );
}

function HeaderBar() {
  const { count, setDrawerOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border-b border-gold/25 bg-ivory/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-sand text-maroon md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            {menuOpen ? (
              <path d="M2 2l14 10M16 2L2 12" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>

        {/* Wordmark */}
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-[0.4em] text-maroon-deep transition group-hover:text-maroon md:text-3xl">
            AVRANI
          </span>
          <span className="hidden text-gold sm:inline">✦</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label-caps relative py-1 transition ${
                  active ? "text-maroon" : "text-ash hover:text-maroon"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I'd%20like%20to%20know%20more%20about%20your%20jhumkas."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 w-10 place-items-center rounded-full border border-sand text-maroon transition hover:border-maroon hover:bg-maroon hover:text-ivory sm:grid"
            aria-label="Chat on WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.44 9.44 0 01-4.81-1.32l-.35-.2-3.57.93.96-3.47-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.9.98 6.68 2.75a9.36 9.36 0 012.75 6.69c0 5.2-4.24 9.43-9.44 9.43zM20.5 3.49A11.8 11.8 0 0012.04 0C5.5 0 .18 5.31.18 11.84c0 2.09.55 4.13 1.6 5.93L.08 24l6.4-1.68a11.85 11.85 0 005.56 1.41h.01c6.53 0 11.85-5.31 11.85-11.84 0-3.16-1.24-6.14-3.4-8.36z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-sand text-maroon transition hover:border-maroon hover:bg-maroon hover:text-ivory"
            aria-label={`Open shopping bag (${count} items)`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 016 0"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-semibold text-maroon-deep">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <nav className="border-t border-sand bg-ivory px-6 py-4 md:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="label-caps block py-3 text-ash transition hover:text-maroon"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://wa.me/919256863315"
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps block py-3 text-maroon"
              >
                WhatsApp us ✦
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
