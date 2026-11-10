import { ProductGridSkeleton } from "@/components/product-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-10 animate-pulse space-y-4">
        <div className="h-3 w-28 rounded bg-sand" />
        <div className="h-12 w-72 rounded bg-sand" />
        <div className="h-4 w-96 max-w-full rounded bg-sand" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
