import { RatingStars } from "@/components/rating-star";
import { createClient } from "@/lib/supabase/server";
import { productFromRow, type ProductRow } from "@/lib/products";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("product")
    .select(`
      prod_id,
      prod_name,
      prod_desc,
      prod_price,
      prod_stock_qty,
      prod_rating,
      prod_sold_qty,
      prod_image,
      prod_cat_link!prod_cat_link_prod_fk(
        prod_cat_id,
        product_category_type!prod_cat_link_prod_cat_fk(
          prod_cat_name)),
      user!product_seller_uuid_fkey(username)
    `)
    .eq("prod_id", numericId)
    .eq("prod_status", "approved")
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const product = productFromRow(row as unknown as ProductRow);
  const outOfStock = product.stockQuantity === 0;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-10">
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-slate-100">
        {outOfStock && (
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

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-4 text-xl font-bold text-teal-700">
          ${product.price}
        </p>
        <p className="mt-2 text-slate-600">Seller: {product.seller}</p>
        <p className="mt-2 text-slate-600">
          Category: {product.category.length ? product.category.join(", ") : "-"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-600">
          <RatingStars rating={product.rating} size={20} />
          <span>{product.rating} / 5</span>
          </div>
        <p className="mt-2 text-slate-600">{product.quantitySold} sold</p>
        <p className="mt-2 text-slate-600">
          In stock: {outOfStock ? "No" : `${product.stockQuantity} available`}
        </p>
      </div>
    </main>
  );
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center text-slate-600">Loading product...</main>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
