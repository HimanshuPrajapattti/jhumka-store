import { getAdminProducts } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const products = await getAdminProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <div className="space-y-8">
      <div>
        <p className="label-caps text-gold-deep">Catalogue</p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold text-maroon-deep">
          Add product
        </h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
