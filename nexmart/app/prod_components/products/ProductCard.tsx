// app/prod_components/products/ProductCard.tsx
import type { Product } from "@/lib/products";
import { RatingStars } from "@/components/rating-star";
import Image from "next/image";
import Link from "next/link";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <Link href={`/products/${product.id}`}>
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="relative aspect-square w-full bg-slate-100">
        {isOutOfStock && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="mt-1 text-sm text-slate-500">Seller: {product.seller}</p>
        <p className="mt-2 font-bold text-teal-700">${product.price}</p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
          <RatingStars rating={product.rating} size={16} />
          <span>{product.rating}</span>
          <span className="text-slate-400">·</span>
          <span>{product.quantitySold} sold</span>
          </div>
      </div>
    </div>
    </Link>
  );
}