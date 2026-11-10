"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart";
import type { CartProduct } from "@/components/cart";

export function ProductActions({ product }: { product: CartProduct }) {
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-5">
        <div>
          <p className="label-caps mb-2 text-ash">Quantity</p>
          <div className="flex items-center rounded-full border border-sand bg-ivory">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              disabled={soldOut}
              className="grid h-11 w-11 place-items-center text-lg text-ash transition hover:text-maroon disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((v) => Math.min(v + 1, product.stock || 99))}
              disabled={soldOut}
              className="grid h-11 w-11 place-items-center text-lg text-ash transition hover:text-maroon disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="self-end pb-1">
          {soldOut ? (
            <p className="label-caps text-ash">Currently unavailable</p>
          ) : product.stock <= 3 ? (
            <p className="label-caps text-maroon">
              Only {product.stock} left ✦
            </p>
          ) : (
            <p className="label-caps text-green-800">In stock ✦ ships fast</p>
          )}
        </div>
      </div>

      <AddToCartButton product={product} qty={qty} variant="full" />

      <p className="text-xs leading-relaxed text-ash">
        Your bag → checkout → we confirm your order on WhatsApp. Free shipping
        across India, COD available.
      </p>
    </div>
  );
}
