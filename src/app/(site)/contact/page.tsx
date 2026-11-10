import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Chat with AVRANI on WhatsApp, email or Instagram — plus shipping, returns, jewellery care and FAQs.",
};

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Add your favourite pairs to the bag, go to checkout, and fill in your details. Your order opens as a ready-made message in our WhatsApp — reply there to confirm payment and shipping.",
  },
  {
    q: "Do you take custom orders?",
    a: "Yes! Match your jhumkas to a saree or lehenga, adjust length, or request a colour — message us on WhatsApp with a reference photo and we'll take it from there.",
  },
  {
    q: "Is cash on delivery available?",
    a: "COD is available across India for orders under ₹3,000. UPI and bank transfer are always welcome for any order value.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 2–3 working days and typically arrive in another 2–5 days depending on your city. You'll get a tracking update on WhatsApp.",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sand bg-gradient-to-b from-cream to-ivory py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="label-caps text-gold-deep">Say hello</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-maroon-deep sm:text-6xl">
            We&apos;d love to
            <span className="gold-text italic"> hear from you</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-ash">
            Questions, custom requests or just want to see today&apos;s
            new pieces? WhatsApp is the fastest way to reach us.
          </p>

          <a
            href="https://wa.me/919256863315?text=Hi%20AVRANI!%20I%20have%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps mt-9 inline-flex items-center gap-3 rounded-full bg-[#0f7a52] px-10 py-4 text-white shadow-[0_14px_34px_-14px_rgba(15,122,82,0.9)] transition hover:bg-[#0c6544]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.44 9.44 0 01-4.81-1.32l-.35-.2-3.57.93.96-3.47-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.9.98 6.68 2.75a9.36 9.36 0 012.75 6.69c0 5.2-4.24 9.43-9.44 9.43z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Channels */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              label: "WhatsApp",
              value: "+91 92568 63315",
              href: "https://wa.me/919256863315",
              note: "Mon – Sat, 10am – 7pm IST",
            },
            {
              label: "Email",
              value: "hello@avrani.in",
              href: "mailto:hello@avrani.in",
              note: "Replies within 24 hours",
            },
            {
              label: "Instagram",
              value: "@avrani.jewels",
              href: "https://instagram.com",
              note: "New drops & styling reels",
            },
          ].map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group rounded-2xl border border-sand bg-ivory p-8 transition hover:border-gold/60 hover:shadow-lg"
            >
              <p className="label-caps text-gold-deep">{channel.label}</p>
              <p className="mt-3 font-display text-2xl font-medium text-maroon-deep transition group-hover:text-maroon">
                {channel.value}
              </p>
              <p className="mt-2 text-sm text-ash">{channel.note}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Info sections */}
      <section className="border-t border-sand bg-cream/60 py-16">
        <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-6 md:grid-cols-2">
          <article id="shipping" className="scroll-mt-32">
            <h2 className="font-display text-3xl font-semibold text-maroon-deep">
              Shipping
            </h2>
            <p className="mt-3 leading-relaxed text-ash">
              Free shipping across India on every order. Pieces are dispatched
              within 2–3 working days and delivered in another 2–5 days, with
              tracking shared on WhatsApp. International shipping is available
              on request.
            </p>
          </article>

          <article id="returns" className="scroll-mt-32">
            <h2 className="font-display text-3xl font-semibold text-maroon-deep">
              Returns
            </h2>
            <p className="mt-3 leading-relaxed text-ash">
              Not right? Report any manufacturing defect within 7 days of
              delivery and we&apos;ll replace your pair free of charge.
              Because of hygiene, earrings can&apos;t be returned for
              change-of-mind — we&apos;re happy to share extra photos and
              videos before you decide.
            </p>
          </article>

          <article id="care" className="scroll-mt-32">
            <h2 className="font-display text-3xl font-semibold text-maroon-deep">
              Jewellery care
            </h2>
            <p className="mt-3 leading-relaxed text-ash">
              Keep pieces away from perfume, water and humidity. Wipe gently
              with a soft dry cloth after wearing and store in the pouch
              provided. Treated kindly, your AVRANI pair will stay festive for
              years.
            </p>
          </article>

          <article id="faq" className="scroll-mt-32">
            <h2 className="font-display text-3xl font-semibold text-maroon-deep">
              FAQs
            </h2>
            <div className="mt-4 space-y-3">
              {FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-sand bg-ivory px-5 py-4"
                >
                  <summary className="cursor-pointer list-none font-medium text-maroon-deep marker:hidden">
                    <span className="mr-3 inline-block text-gold transition group-open:rotate-45">
                      ✦
                    </span>
                    {item.q}
                  </summary>
                  <p className="mt-3 pl-7 text-sm leading-relaxed text-ash">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
