// app/prod_components/products/ProductGrid.tsx
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
        No products match the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}