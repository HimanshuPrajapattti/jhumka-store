import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/data";
import { AddToCartButton } from "@/components/add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <article className="group">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-4/5 overflow-hidden rounded-xl border border-sand bg-cream"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-5xl text-sand">
            ✦
          </span>
        )}

        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-ivory uppercase">
            Sold out
          </span>
        )}
        {product.stock > 0 && product.stock <= 3 && (
          <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-ivory uppercase">
            Only {product.stock} left
          </span>
        )}
        {product.featured && product.stock > 3 && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-maroon-deep uppercase">
            Bestseller
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps text-gold-deep">{product.category}</p>
          <h3 className="mt-1 font-display text-xl leading-snug font-medium text-maroon-deep">
            <Link href={`/product/${product.slug}`} className="hover:text-gold-deep">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-medium text-ink">
            {formatINR(product.price)}
          </p>
        </div>

        <AddToCartButton
          variant="compact"
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? "",
            stock: product.stock,
          }}
        />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-4/5 rounded-xl border border-sand bg-cream" />
          <div className="mt-4 h-3 w-16 rounded bg-sand" />
          <div className="mt-2 h-4 w-3/4 rounded bg-sand" />
          <div className="mt-2 h-3 w-20 rounded bg-sand" />
        </div>
      ))}
    </div>
  );
}
