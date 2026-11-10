import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getShopProducts } from "@/lib/data";
import { ProductCard, ProductGridSkeleton } from "@/components/product-card";

export const metadata = {
  title: "Shop all jhumkas",
  description:
    "Browse every AVRANI jhumka, chandbali, temple and stud pair — handcrafted, small batch, ships pan-India.",
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <header className="mb-10 max-w-2xl">
        <p className="label-caps text-gold-deep">The collection</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-maroon-deep sm:text-6xl">
          All pieces
        </h1>
        <p className="mt-4 text-ash">
          Every pair is finished by hand, so what you see is what ships —
          small batch, never mass made.
        </p>
      </header>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ShopResults searchParamsPromise={props.searchParams} />
      </Suspense>
    </div>
  );
}

type SearchValue = string | string[] | undefined;

function first(value: SearchValue): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function ShopResults({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps<"/shop">["searchParams"];
}) {
  const sp = await searchParamsPromise;
  const category = first(sp.category);
  const q = first(sp.q).trim();

  const [products, categories] = await Promise.all([
    getShopProducts(category || undefined, q || undefined),
    getCategories(),
  ]);

  const chipHref = (target: string) => {
    const params = new URLSearchParams();
    if (target) params.set("category", target);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={chipHref("")}
            className={`label-caps rounded-full border px-5 py-2.5 transition ${
              !category
                ? "border-maroon bg-maroon text-ivory"
                : "border-sand bg-ivory text-ash hover:border-maroon hover:text-maroon"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={chipHref(c)}
              className={`label-caps rounded-full border px-5 py-2.5 transition ${
                category === c
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-sand bg-ivory text-ash hover:border-maroon hover:text-maroon"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <form action="/shop" method="GET" className="flex items-center gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search jhumkas…"
            className="w-48 rounded-full border border-sand bg-ivory px-5 py-2.5 text-sm outline-none transition placeholder:text-ash/70 focus:border-maroon"
          />
          <button
            type="submit"
            className="label-caps rounded-full border border-maroon px-5 py-2.5 text-maroon transition hover:bg-maroon hover:text-ivory"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-ash">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
        {category && ` in ${category}`}
        {q && ` matching “${q}”`}
      </p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/60 bg-cream/60 px-8 py-20 text-center">
          <p className="font-display text-3xl text-maroon-deep">
            Nothing matched that search
          </p>
          <p className="mt-2 text-ash">
            Try another word — or browse every pair we have.
          </p>
          <Link
            href="/shop"
            className="label-caps mt-6 inline-block rounded-full bg-maroon px-8 py-3.5 text-ivory transition hover:bg-maroon-deep"
          >
            Show all pieces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
