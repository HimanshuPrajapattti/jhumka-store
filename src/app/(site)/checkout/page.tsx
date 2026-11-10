import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-10">
        <p className="label-caps text-gold-deep">Almost yours</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-maroon-deep">
          Checkout
        </h1>
        <p className="mt-3 max-w-xl text-ash">
          Share your details — your order lands in our WhatsApp in a formatted
          message, and we take it from there.
        </p>
      </header>
      <CheckoutView />
    </div>
  );
}
