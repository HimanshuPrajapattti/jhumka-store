import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProductBySlug, getShopProducts } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Piece not found" };
  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} — handcrafted jhumka jewellery by AVRANI.`,
  };
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl animate-pulse px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square rounded-2xl border border-sand bg-cream" />
            <div className="space-y-4 pt-6">
              <div className="h-3 w-24 rounded bg-sand" />
              <div className="h-10 w-3/4 rounded bg-sand" />
              <div className="h-6 w-28 rounded bg-sand" />
              <div className="h-24 w-full rounded bg-sand" />
              <div className="h-14 w-full rounded-full bg-sand" />
            </div>
          </div>
        </div>
      }
    >
      <ProductView paramsPromise={props.params} />
    </Suspense>
  );
}

async function ProductView({
  paramsPromise,
}: {
  paramsPromise: PageProps<"/product/[slug]">["params"];
}) {
  const { slug } = await paramsPromise;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getShopProducts(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="label-caps mb-8 flex flex-wrap items-center gap-2 text-ash">
        <Link href="/" className="hover:text-maroon">
          Home
        </Link>
        <span className="text-gold">/</span>
        <Link href="/shop" className="hover:text-maroon">
          Shop
        </Link>
        <span className="text-gold">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-maroon"
        >
          {product.category}
        </Link>
        <span className="text-gold">/</span>
        <span className="text-maroon">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="md:pt-4">
          <p className="label-caps text-gold-deep">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-maroon-deep sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 font-display text-4xl font-semibold text-maroon">
            {formatINR(product.price)}
          </p>

          <div className="my-6 h-px w-full bg-gradient-to-r from-gold/60 via-sand to-transparent" />

          <p className="leading-relaxed text-ash">{product.description}</p>

          <ProductActions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? "",
              stock: product.stock,
            }}
          />

          {/* Details */}
          <dl className="mt-10 divide-y divide-sand border-y border-sand text-sm">
            {[
              ["Materials", "Brass base · anti-tarnish gold plating · glass stones"],
              ["Care", "Keep away from perfume & water; store in the pouch provided"],
              ["Shipping", "Dispatched in 2–3 days · free across India · COD available"],
              ["Returns", "Easy 7-day replacement on manufacturing defects"],
            ].map(([term, detail]) => (
              <div key={term} className="grid grid-cols-[110px_1fr] gap-4 py-4">
                <dt className="label-caps text-maroon">{term}</dt>
                <dd className="text-ash">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="label-caps text-gold-deep">Keep looking</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-maroon-deep sm:text-4xl">
                You may also love
              </h2>
            </div>
            <Link
              href="/shop"
              className="label-caps border-b border-gold pb-1 text-maroon transition hover:text-gold-deep"
            >
              All pieces →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
