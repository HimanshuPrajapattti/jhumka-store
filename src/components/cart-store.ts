"use client";

/**
 * External cart store (localStorage-backed) consumed via useSyncExternalStore.
 * Keeping cart state here — instead of setState inside effects — gives React
 * a proper external-system subscription and avoids hydration mismatches.
 */

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
};

export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
};

const STORAGE_KEY = "avrani-cart-v1";
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function validate(parsed: unknown): CartItem[] {
  if (!Array.isArray(parsed)) return [];
  return (parsed as CartItem[]).filter(
    (i) =>
      i &&
      typeof i.id === "number" &&
      typeof i.slug === "string" &&
      typeof i.name === "string" &&
      typeof i.price === "number" &&
      typeof i.qty === "number" &&
      typeof i.stock === "number",
  );
}

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return validate(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persist(items: CartItem[]): void {
  try {
    if (items.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full or unavailable — cart still works in memory */
  }
}

function commit(next: CartItem[]): void {
  cache = next;
  persist(next);
  for (const listener of listeners) listener();
}

/* ---- Snapshot API (useSyncExternalStore) ---- */

export function getCart(): CartItem[] {
  if (cache === null) cache = read();
  return cache;
}

export function getServerCart(): CartItem[] {
  return EMPTY;
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      cache = read();
      for (const l of listeners) l();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---- Mutations ---- */

export function addProduct(product: CartProduct, qty = 1): void {
  const items = getCart();
  const existing = items.find((i) => i.id === product.id);

  if (existing) {
    const max = Math.max(product.stock, existing.qty);
    commit(
      items.map((i) =>
        i.id === product.id
          ? {
              ...i,
              qty: Math.min(existing.qty + qty, max),
              stock: product.stock,
            }
          : i,
      ),
    );
    return;
  }

  commit([
    ...items,
    {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: Math.min(qty, Math.max(product.stock, 1)),
      stock: product.stock,
    },
  ]);
}

export function changeQty(id: number, qty: number): void {
  commit(
    getCart().map((i) =>
      i.id === id
        ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) }
        : i,
    ),
  );
}

export function removeItem(id: number): void {
  commit(getCart().filter((i) => i.id !== id));
}

export function clearCart(): void {
  commit(EMPTY);
}
