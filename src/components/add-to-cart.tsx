"use client";

import { useCart, type CartProduct } from "@/components/cart";

type Props = {
  product: CartProduct;
  variant?: "full" | "compact";
  qty?: number;
};

export function AddToCartButton({ product, variant = "full", qty = 1 }: Props) {
  const { add, ready } = useCart();
  const soldOut = product.stock <= 0;

  if (soldOut) {
    return (
      <span
        className={`label-caps inline-block rounded-full border border-sand bg-cream px-6 py-3 text-center text-ash ${
          variant === "full" ? "w-full" : ""
        }`}
      >
        Sold out
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => add(product, qty)}
      className={
        variant === "full"
          ? "label-caps w-full rounded-full bg-maroon px-8 py-4 text-ivory shadow-[0_10px_30px_-12px_rgba(109,26,46,0.7)] transition hover:bg-maroon-deep disabled:opacity-60"
          : "label-caps rounded-full border border-gold/60 px-4 py-2 text-maroon transition hover:bg-maroon hover:text-ivory hover:border-maroon disabled:opacity-60"
      }
    >
      {variant === "full" ? "Add to bag" : "Add"}
    </button>
  );
}
