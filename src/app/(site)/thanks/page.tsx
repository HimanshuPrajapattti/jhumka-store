import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getOrderByRef } from "@/lib/admin-data";
import { businessLink, normalizeCustomerPhone } from "@/lib/whatsapp";
import { formatINR } from "@/lib/format";
import { WhatsAppHandoff } from "@/components/whatsapp-handoff";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false },
};

export default function ThanksPage(props: PageProps<"/thanks">) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Suspense
        fallback={
          <div className="animate-pulse rounded-3xl border border-sand bg-cream/60 p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-sand" />
            <div className="mx-auto mt-6 h-8 w-64 rounded bg-sand" />
            <div className="mx-auto mt-3 h-4 w-80 max-w-full rounded bg-sand" />
          </div>
        }
      >
        <ThankYou searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function ThankYou({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/thanks">["searchParams"];
}) {
  const sp = await searchParamsPromise;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const order = ref ? getOrderByRef(ref) : null;

  if (!order) {
    return (
      <div className="rounded-3xl border border-sand bg-cream/60 px-8 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-maroon text-3xl text-gold">
          ✦
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold text-maroon-deep">
          Thank you
        </h1>
        <p className="mt-3 text-ash">
          We appreciate you visiting AVRANI.
        </p>
        <Link
          href="/shop"
          className="label-caps mt-8 inline-block rounded-full bg-maroon px-8 py-3.5 text-ivory transition hover:bg-maroon-deep"
        >
          Continue browsing
        </Link>
      </div>
    );
  }

  const waUrl = businessLink(order.message);
  const customerWa = normalizeCustomerPhone(order.phone);

  return (
    <div className="rounded-3xl border border-sand bg-ivory p-8 shadow-[0_30px_70px_-45px_rgba(75,15,31,0.5)] sm:p-12">
      <div className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-maroon text-gold shadow-[0_16px_36px_-16px_rgba(109,26,46,0.8)]">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M4.5 12.5l5 5 10-11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="label-caps mt-6 text-gold-deep">
          Order {order.ref} received
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-maroon-deep sm:text-5xl">
          Thank you, {order.customer_name.split(" ")[0]}!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ash">
          Your bag is packed with intention. Open WhatsApp below — your order is
          already typed out for us.
        </p>
      </div>

      {/* Items */}
      <ul className="mt-9 divide-y divide-sand rounded-2xl border border-sand bg-cream/60 px-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-medium text-maroon-deep">
                {item.product_name}
              </p>
              <p className="text-sm text-ash">
                {formatINR(item.price)} × {item.qty}
              </p>
            </div>
            <p className="font-medium">{formatINR(item.price * item.qty)}</p>
          </li>
        ))}
        <li className="flex items-center justify-between py-4">
          <span className="label-caps text-maroon">Total</span>
          <span className="font-display text-3xl font-semibold text-maroon-deep">
            {formatINR(order.total)}
          </span>
        </li>
      </ul>

      <WhatsAppHandoff url={waUrl} reference={order.ref} />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ash">
        <p>
          Sent to{" "}
          <a
            href={`https://wa.me/${customerWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-maroon underline-offset-4 hover:underline"
          >
            +{customerWa}
          </a>
        </p>
        <Link href="/shop" className="text-maroon underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
