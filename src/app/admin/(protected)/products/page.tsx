import Image from "next/image";
import Link from "next/link";
import { deleteProduct } from "@/actions/admin";
import { getAdminProducts } from "@/lib/admin-data";
import { formatINR } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-gold-deep">Catalogue</p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
            Products
          </h1>
          <p className="mt-1 text-sm text-ash">
            {products.length} {products.length === 1 ? "piece" : "pieces"} live
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="label-caps rounded-full bg-maroon px-6 py-3 text-ivory transition hover:bg-maroon-deep"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/60 bg-ivory px-8 py-16 text-center">
          <p className="font-display text-3xl text-maroon-deep">
            No products yet
          </p>
          <p className="mt-2 text-sm text-ash">
            Add your first jhumka to put it live on the site.
          </p>
          <Link
            href="/admin/products/new"
            className="label-caps mt-6 inline-block rounded-full bg-maroon px-8 py-3.5 text-ivory transition hover:bg-maroon-deep"
          >
            Add your first piece
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-4 rounded-2xl border border-sand bg-ivory p-4 sm:flex-row sm:items-center sm:p-5"
            >
              {/* Thumb */}
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-sand bg-cream">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center font-display text-3xl text-sand">
                    ✦
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-medium text-maroon-deep">
                    {product.name}
                  </h2>
                  {product.featured && (
                    <span className="rounded-full bg-gold/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-gold-deep uppercase">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-ash">
                  {product.category} · /product/{product.slug}
                </p>
              </div>

              {/* Numbers */}
              <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-1">
                <p className="font-medium text-ink">
                  {formatINR(product.price)}
                </p>
                <p
                  className={`text-sm ${
                    product.stock === 0
                      ? "font-medium text-maroon"
                      : product.stock <= 3
                        ? "text-amber-700"
                        : "text-ash"
                  }`}
                >
                  {product.stock === 0
                    ? "Sold out"
                    : `${product.stock} in stock`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-sand pt-4 sm:border-0 sm:pt-0">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="label-caps rounded-full border border-maroon px-5 py-2.5 text-maroon transition hover:bg-maroon hover:text-ivory"
                >
                  Edit
                </Link>
                <DeleteProductButton
                  id={product.id}
                  name={product.name}
                  action={deleteProduct}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
