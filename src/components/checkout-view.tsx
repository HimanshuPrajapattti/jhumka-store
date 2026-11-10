"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { placeOrder, type CheckoutState } from "@/actions/checkout";
import { useCart } from "@/components/cart";
import { formatINR } from "@/lib/format";

export function CheckoutView() {
  const { items, subtotal, ready, clear } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    null,
  );

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location is not available in this browser. Please enter your address.",
      );
      return;
    }

    setLocating(true);
    setLocationStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapsUrl = `https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
        setAddress((current) => {
          const addressWithoutPin = current
            .split(/\r?\n/)
            .filter((line) => !line.startsWith("Location pin:"))
            .join("\n")
            .trim();
          return [addressWithoutPin, `Location pin: ${mapsUrl}`]
            .filter(Boolean)
            .join("\n");
        });
        setLocationStatus(
          "Location added. Please include your house/flat and any landmark too.",
        );
        setLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow access in your browser or enter your address manually."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Your location could not be determined. Please enter your address manually."
              : "Location request timed out. Please try again or enter your address manually.";
        setLocationStatus(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  // Success: clear the bag, show the thank-you page, then hand off to WhatsApp.
  useEffect(() => {
    if (!state?.ok) return;
    clear();
    router.replace(`/thanks?ref=${encodeURIComponent(state.ref ?? "")}`);
  }, [state, clear, router]);

  if (!ready) {
    return (
      <div className="grid animate-pulse gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-cream" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-cream" />
      </div>
    );
  }

  if (items.length === 0 && !state?.ok) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/60 bg-cream/60 px-8 py-20 text-center">
        <p className="font-display text-3xl text-maroon-deep">
          Your bag is empty
        </p>
        <p className="mt-2 text-ash">Add a pair or two, then come back.</p>
        <Link
          href="/shop"
          className="label-caps mt-6 inline-block rounded-full bg-maroon px-8 py-3.5 text-ivory transition hover:bg-maroon-deep"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      {/* ------------- Form ------------- */}
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div
            role="alert"
            className="rounded-xl border border-maroon/30 bg-maroon/8 px-5 py-4 text-sm text-maroon-deep"
          >
            {state.error}
          </div>
        )}

        <div className="rounded-2xl border border-sand bg-ivory p-6 sm:p-8">
          <p className="label-caps mb-6 text-maroon">Your details</p>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="label-caps text-ash">Full name *</span>
              <input
                name="name"
                required
                minLength={2}
                autoComplete="name"
                placeholder="Priya Sharma"
                className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition placeholder:text-ash/60 focus:border-maroon focus:bg-ivory"
              />
            </label>

            <label className="block">
              <span className="label-caps text-ash">WhatsApp number *</span>
              <input
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition placeholder:text-ash/60 focus:border-maroon focus:bg-ivory"
              />
            </label>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="delivery-address" className="label-caps text-ash">
                Delivery address *
              </label>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating || pending}
                className="label-caps rounded-full border border-maroon/40 px-4 py-2 text-maroon transition hover:bg-maroon hover:text-ivory disabled:cursor-wait disabled:opacity-60"
              >
                {locating ? "Getting location…" : "Use current location"}
              </button>
            </div>
            <textarea
              id="delivery-address"
              name="address"
              required
              minLength={10}
              rows={3}
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Flat / house, street, area, city, state & PIN code"
              className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition placeholder:text-ash/60 focus:border-maroon focus:bg-ivory"
            />
            <p aria-live="polite" className="mt-2 text-xs leading-relaxed text-ash">
              {locationStatus ||
                "Your browser will ask permission. A map pin is added to your address; add your house/flat and landmark for delivery."}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="label-caps text-ash">Note (optional)</span>
            <textarea
              name="note"
              rows={2}
              maxLength={300}
              placeholder="Gift wrap it / call before delivery / matching earrings…"
              className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition placeholder:text-ash/60 focus:border-maroon focus:bg-ivory"
            />
          </label>
        </div>

        {/* Cart snapshot — the items the server will price */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })))}
        />

        <button
          type="submit"
          disabled={pending}
          className="label-caps w-full rounded-full bg-maroon px-8 py-4.5 text-ivory shadow-[0_14px_34px_-14px_rgba(109,26,46,0.8)] transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Placing your order…" : "Place order on WhatsApp"}
        </button>

        <p className="text-center text-xs text-ash">
          No online payment needed — we confirm everything with you on WhatsApp
          before dispatch.
        </p>
      </form>

      {/* ------------- Summary ------------- */}
      <aside className="md:sticky md:top-36 md:self-start">
        <div className="rounded-2xl border border-sand bg-cream/70 p-6 sm:p-8">
          <p className="label-caps mb-5 text-maroon">Order summary</p>

          <ul className="divide-y divide-sand">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-sand bg-ivory">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-medium text-maroon-deep">
                    {item.name}
                  </p>
                  <p className="text-sm text-ash">
                    {formatINR(item.price)} × {item.qty}
                  </p>
                </div>
                <p className="font-medium text-ink">
                  {formatINR(item.price * item.qty)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-sand pt-5 text-sm">
            <div className="flex justify-between text-ash">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Shipping</span>
              <span className="text-green-800">Free ✦</span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="label-caps text-maroon">Total</span>
              <span className="font-display text-3xl font-semibold text-maroon-deep">
                {formatINR(subtotal)}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 px-2 text-xs leading-relaxed text-ash">
          On placing your order, this list opens as a ready message in WhatsApp
          to <span className="font-medium text-maroon">+91 92568 63315</span> —
          it also lands in our order dashboard automatically.
        </p>
      </aside>
    </div>
  );
}
