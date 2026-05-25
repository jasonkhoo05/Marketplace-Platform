// app/prod_components/products/ProductCard.tsx
import type { ProductView } from "@/lib/products";
import { RatingStars } from "@/components/rating-star";
import Image from "next/image";
import Link from "next/link";

type Props = {
  product: ProductView;
};

export default function ProductCard({ product }: Props) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <Link href={`/buyer/products/${product.id}`}>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md">
      <div className="relative aspect-[1/1] w-full bg-slate-100">
        {isOutOfStock && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-contain transition duration-300 hover:scale-105"
        />
      </div>

      <div className="space-y-1 p-4">
      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
        {product.name}
      </h3>
        <p className="text-xs text-slate-500">Seller: {product.seller}</p>
        <p className="text-lg font-bold text-teal-700">${product.price}</p>

        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <RatingStars rating={product.rating} size={16} />
            <span>{product.rating}</span>
        </div>

        <p>{product.quantitySold} sold</p>
      </div>
      </div>
    </div>
    </Link>
  );
}