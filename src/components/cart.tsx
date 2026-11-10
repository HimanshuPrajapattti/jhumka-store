"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  addProduct,
  changeQty,
  clearCart,
  getCart,
  getServerCart,
  removeItem,
  subscribeCart,
  type CartProduct,
} from "@/components/cart-store";

// Re-exported for existing consumers (add-to-cart, product-actions).
export type { CartItem, CartProduct } from "@/components/cart-store";

/**
 * "Mounted" detection without setState-in-effect: during SSR/hydration React
 * uses the server snapshot (false); after hydration the client snapshot
 * (true) forces a single re-render. All three functions are module-level so
 * useSyncExternalStore never resubscribes.
 */
const subscribeMounted = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

type CartContextValue = {
  items: ReturnType<typeof getCart>;
  count: number;
  subtotal: number;
  ready: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (product: CartProduct, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, getCart, getServerCart);
  const ready = useSyncExternalStore(
    subscribeMounted,
    getMounted,
    getServerMounted,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    ready,
    drawerOpen,
    setDrawerOpen,
    add: addProduct,
    setQty: changeQty,
    remove: removeItem,
    clear: clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Slide-over cart drawer                                              */
/* ------------------------------------------------------------------ */

export function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, setQty, remove, ready } =
    useCart();

  if (!ready) return null;

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 animate-fade"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <header className="flex items-center justify-between border-b border-sand px-6 py-5">
          <div>
            <p className="label-caps text-gold-deep">Your selection</p>
            <h2 className="font-display text-3xl font-semibold text-maroon-deep">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full border border-sand text-ash transition hover:border-maroon hover:text-maroon"
            aria-label="Close cart"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-gold text-gold">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 016 0"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </div>
            <p className="font-display text-2xl text-maroon-deep">
              Your bag is empty
            </p>
            <p className="text-sm text-ash">
              Discover handcrafted jhumkas made to turn heads.
            </p>
            <Link
              href="/shop"
              onClick={() => setDrawerOpen(false)}
              className="label-caps rounded-full bg-maroon px-7 py-3 text-ivory transition hover:bg-maroon-deep"
            >
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-cream">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="font-display text-lg leading-tight font-medium text-maroon-deep hover:text-gold-deep"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-ash">
                      {formatINR(item.price)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-sand">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="grid h-8 w-8 place-items-center text-ash hover:text-maroon"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-medium">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="grid h-8 w-8 place-items-center text-ash hover:text-maroon"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="text-xs tracking-wide text-ash underline-offset-4 hover:text-maroon hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-sand bg-cream/60 px-6 py-5">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="label-caps text-ash">Subtotal</span>
                <span className="font-display text-3xl font-semibold text-maroon-deep">
                  {formatINR(subtotal)}
                </span>
              </div>
              <p className="mb-4 text-xs text-ash">
                Shipping calculated as free · Orders are confirmed on WhatsApp.
              </p>
              <Link
                href="/checkout"
                onClick={() => setDrawerOpen(false)}
                className="label-caps block w-full rounded-full bg-maroon py-4 text-center text-ivory transition hover:bg-maroon-deep"
              >
                Proceed to checkout
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-3 w-full text-center text-sm text-ash hover:text-maroon"
              >
                Continue browsing
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
