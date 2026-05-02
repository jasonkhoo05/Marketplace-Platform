// components/products/ProductCard.tsx
import type { Product } from "@/lib/products";
import Image from "next/image";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      
      {/* image container */}
      <div className="relative aspect-square w-full bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* text */}
      <div className="p-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="mt-2 font-bold text-teal-700">${product.price}</p>
      </div>

    </div>
  );
}