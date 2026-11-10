import Image from "next/image";
import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import { getSiteAppearance } from "@/lib/appearance";
import { ProductCard } from "@/components/product-card";

const STRIP = [
  "Handcrafted in small batches",
  "Anti-tarnish plating",
  "COD across India",
  "Ships in 2–3 days",
];

export default async function HomePage() {
  const [featured, categories, appearance] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getSiteAppearance(),
  ]);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-cream via-ivory to-ivory"
        style={
          appearance.homeBackgroundImage?.url
            ? {
                backgroundImage: `linear-gradient(to bottom, rgb(244 236 223 / 88%), rgb(251 247 241 / 88%)), url("${appearance.homeBackgroundImage.url}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(195,160,90,0.35), transparent 65%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise">
            <p className="label-caps text-gold-deep">
              Est. 2026 <span className="mx-2 text-gold">✦</span> Handcrafted in India
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] font-semibold text-maroon-deep sm:text-6xl lg:text-7xl">
              Jhumkas that tell
              <br />
              your{" "}
              <span className="gold-text italic">story</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ash">
              Timeless jhumkas, handcrafted for you — painted, beaded and
              polished one pair at a time in our little studio. Pick your
              favourite, fill your bag, and order in a tap on WhatsApp.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="label-caps rounded-full bg-maroon px-9 py-4 text-ivory shadow-[0_14px_34px_-14px_rgba(109,26,46,0.8)] transition hover:bg-maroon-deep"
              >
                Shop the collection
              </Link>
              <a
                href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I%20want%20to%20see%20your%20latest%20jhumkas."
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps rounded-full border border-maroon/30 px-9 py-4 text-maroon transition hover:border-maroon hover:bg-maroon hover:text-ivory"
              >
                WhatsApp us
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-rise">
            <div className="relative aspect-square overflow-hidden rounded-full border border-gold/40 bg-maroon-deep shadow-[0_40px_80px_-40px_rgba(75,15,31,0.7)]">
              <Image
                src={appearance.heroImage.url}
                alt="Handcrafted gold jhumka from AVRANI"
                fill
                priority
                sizes="(max-width: 768px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -left-2 top-6 rotate-[-6deg] rounded-full border border-gold/50 bg-ivory px-5 py-3 shadow-lg sm:-left-8">
              <p className="label-caps text-maroon">Hand-finished ✦</p>
            </div>
            <div className="absolute -right-2 bottom-10 rotate-[5deg] rounded-full border border-gold/50 bg-ivory px-5 py-3 shadow-lg sm:-right-6">
              <p className="label-caps text-maroon">Ships pan-India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Strip ---------------- */}
      <div className="bg-maroon-deep py-3.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-6">
          {STRIP.map((item) => (
            <p key={item} className="label-caps text-cream/85">
              <span className="mr-3 text-gold">✦</span>
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* ---------------- Featured ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps text-gold-deep">Curated for you</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-maroon-deep sm:text-5xl">
              The AVRANI Edit
            </h2>
          </div>
          <Link
            href="/shop"
            className="label-caps border-b border-gold pb-1 text-maroon transition hover:text-gold-deep"
          >
            View all pieces →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="border-y border-sand bg-cream/70 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="label-caps text-gold-deep">Shop by mood</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-maroon-deep">
            Find your pair
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="label-caps rounded-full border border-gold/50 bg-ivory px-7 py-3.5 text-maroon transition hover:border-maroon hover:bg-maroon hover:text-ivory"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Story ---------------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-sm">
          {/* Arch frame — a nod to Indian doorways */}
          <div className="aspect-3/4 overflow-hidden rounded-t-[999px] border border-gold/40 bg-gradient-to-b from-cream to-sand">
            <Image
              src="/products/jhumka-maroon.svg"
              alt="Meenakari jhumka detail"
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-cover px-6 pt-8"
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-maroon px-6 py-3 shadow-lg">
            <p className="label-caps text-ivory">Small batch ✦ always</p>
          </div>
        </div>

        <div>
          <p className="label-caps text-gold-deep">Our craft</p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-maroon-deep sm:text-5xl">
            Slow-made, seriously sparkly
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-ash">
            Every AVRANI pair begins as a sketch on our studio table. We
            hand-paint the enamel, set each stone, and let the beads fall
            exactly where they should — because jewellery should feel made for
            you, not manufactured for everyone.
          </p>
          <ul className="mt-7 space-y-4">
            {[
              "Lightweight frames you can wear from morning to midnight",
              "Anti-tarnish plating that survives real life",
              "Packed in a soft pouch, ready to gift",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 text-gold">✦</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="label-caps mt-9 inline-block border-b border-gold pb-1 text-maroon transition hover:text-gold-deep"
          >
            Read our story →
          </Link>
        </div>
      </section>

      {/* ---------------- WhatsApp CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-maroon-deep px-8 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(600px 240px at 50% 0%, rgba(195,160,90,0.28), transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="label-caps text-gold">Order in a tap</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ivory sm:text-5xl">
              Your next favourite pair is one message away
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream/75">
              Fill your bag, check out, and we&apos;ll confirm everything on
              WhatsApp — sizes, shipping and payment, the human way.
            </p>
            <a
              href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I%20want%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps mt-9 inline-block rounded-full bg-gold px-10 py-4 text-maroon-deep transition hover:bg-cream"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
