import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-maroon-deep text-cream">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <p className="font-display text-3xl font-semibold tracking-[0.35em] text-gold">
              AVRANI
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Handcrafted jhumka jewellery for women who love a little drama
              with their elegance. Designed in small batches, finished by hand.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-cream/25 text-cream/80 transition hover:border-gold hover:text-gold"
                aria-label="Instagram"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://wa.me/919256863315?text=Hi%20AVRANI!"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-cream/25 text-cream/80 transition hover:border-gold hover:text-gold"
                aria-label="WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.44 9.44 0 01-4.81-1.32l-.35-.2-3.57.93.96-3.47-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.9.98 6.68 2.75a9.36 9.36 0 012.75 6.69c0 5.2-4.24 9.43-9.44 9.43z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="label-caps text-gold">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
              <li><Link href="/" className="transition hover:text-gold">Home</Link></li>
              <li><Link href="/shop" className="transition hover:text-gold">Shop all</Link></li>
              <li><Link href="/about" className="transition hover:text-gold">Our story</Link></li>
              <li><Link href="/contact" className="transition hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          {/* Care */}
          <div>
            <p className="label-caps text-gold">Care</p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
              <li><Link href="/contact#shipping" className="transition hover:text-gold">Shipping</Link></li>
              <li><Link href="/contact#returns" className="transition hover:text-gold">Returns</Link></li>
              <li><Link href="/contact#faq" className="transition hover:text-gold">FAQs</Link></li>
              <li><Link href="/contact#care" className="transition hover:text-gold">Jewellery care</Link></li>
            </ul>
          </div>

          {/* Reach us */}
          <div>
            <p className="label-caps text-gold">Reach us</p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/75">
              <li>
                <a
                  href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I'd%20like%20to%20place%20an%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-gold"
                >
                  WhatsApp +91 92568 63315
                </a>
              </li>
              <li><a href="mailto:hello@avrani.in" className="transition hover:text-gold">hello@avrani.in</a></li>
              <li className="text-cream/60">Mon – Sat, 10am – 7pm IST</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs tracking-wider text-cream/55 sm:flex-row">
          <p>© 2026 AVRANI · Handcrafted jhumka jewellery</p>
          <p>Made with love in India ✦ Payments confirmed on WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}
