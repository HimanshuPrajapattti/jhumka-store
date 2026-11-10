import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "AVRANI is a small-batch jhumka studio — hand-painted, hand-set, and made for women who love drama with their elegance.",
};

const VALUES = [
  {
    title: "Made by hand",
    body: "Every dome is painted, beaded and polished by artisans we know by name. No assembly line touches your pair.",
  },
  {
    title: "Small batch, always",
    body: "We make in limited runs so your jhumkas stay special. When a piece is gone, it may never return.",
  },
  {
    title: "Wearable weight",
    body: "Grand in look, gentle on the ear. We obsess over balance so you can dance all night without a wince.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sand bg-gradient-to-b from-cream to-ivory py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="label-caps text-gold-deep">Our story</p>
          <h1 className="mt-4 font-display text-5xl leading-tight font-semibold text-maroon-deep sm:text-6xl">
            A little studio,
            <br />
            a lot of{" "}
            <span className="gold-text italic">sparkle</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ash">
            AVRANI began with a single pair of jhumkas worn to a wedding —
            and the ten people who stopped us to ask where they were from.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-[1fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="aspect-3/4 overflow-hidden rounded-t-[999px] border border-gold/40 bg-gradient-to-b from-sand to-cream">
            <Image
              src="/products/jhumka-pearl.svg"
              alt="Pearl jhumka illustration"
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-cover px-6 pt-10"
            />
          </div>
        </div>

        <div className="space-y-5 leading-relaxed text-ash">
          <p className="label-caps text-gold-deep">How it started</p>
          <p>
            What began as weekend experiments at a dining table is now a
            devoted little studio in India, crafting jhumkas for women who
            refuse to choose between tradition and personal style.
          </p>
          <p>
            We draw from temple jewellery, meenakari painting, kundan setting
            and the chaos of a bridal boutique — then edit it down into pairs
            you can wear with a saree on Saturday and a kurta on Monday.
          </p>
          <p>
            Every AVRANI order is packed by hand with a hand-written note,
            because the little things are the big things. And every order
            arrives on our WhatsApp as a neat message — so there&apos;s always
            a human on the other side, never a ticket number.
          </p>
          <blockquote className="border-l-2 border-gold pl-5 font-display text-2xl leading-snug text-maroon-deep italic">
            “Jewellery should feel like it was made for the version of you
            that walks into every room a little louder.”
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-sand bg-cream/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="label-caps text-gold-deep">What we stand for</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-maroon-deep sm:text-5xl">
              The AVRANI way
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className="rounded-2xl border border-sand bg-ivory p-8 transition hover:border-gold/60 hover:shadow-lg"
              >
                <span className="font-display text-5xl text-gold/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-maroon-deep">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ash">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl">
          Ready to find your pair?
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="label-caps rounded-full bg-maroon px-9 py-4 text-ivory transition hover:bg-maroon-deep"
          >
            Shop the collection
          </Link>
          <a
            href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I%20read%20your%20story%20and%20want%20to%20see%20your%20jhumkas."
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps rounded-full border border-maroon/30 px-9 py-4 text-maroon transition hover:border-maroon hover:bg-maroon hover:text-ivory"
          >
            Talk to us
          </a>
        </div>
      </section>
    </div>
  );
}
