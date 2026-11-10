import { notFound } from "next/navigation";
import { getAdminProduct, getAdminProducts } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]/edit">,
) {
  const { id } = await props.params;
  const productId = Number(id);
  const product = Number.isInteger(productId)
    ? await getAdminProduct(productId)
    : null;

  if (!product) notFound();

  const categories = [
    ...new Set((await getAdminProducts()).map((p) => p.category)),
  ].sort();

  return (
    <div className="space-y-8">
      <div>
        <p className="label-caps text-gold-deep">Catalogue</p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
          Edit product
        </h1>
        <p className="mt-1 text-sm text-ash">{product.name}</p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
