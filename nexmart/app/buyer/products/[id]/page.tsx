import ProductPurchasePanel from "@/app/buyer/prod_components/products/ProductPurchasePanel";
import BuyerHeader from "@/app/buyer/prod_components/layout/BuyerHeader";
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
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const product = productFromRow(row as unknown as ProductRow);
  const outOfStock = product.stockQuantity === 0;

  return (
      <>
    <BuyerHeader />

    <main className="min-h-screen bg-slate-50 px-10 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-[420px_1fr] gap-10">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {outOfStock && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    Out of stock
                  </span>
                )}
  
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="420px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
  
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {product.name}
              </h1>
  
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal-700">
                    {product.rating}
                  </span>
                  <RatingStars rating={product.rating} size={18} />
                </div>
  
                <span className="h-4 w-px bg-slate-200" />
  
                <span>{product.quantitySold} sold</span>
              </div>
  
              <div className="mt-6 rounded-xl bg-slate-50 px-6 py-5">
                <p className="text-3xl font-bold text-teal-700">
                  ${product.price}
                </p>
              </div>
  
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex">
                  <p className="w-24 text-slate-500">Seller</p>
                  <p className="font-medium text-slate-800">{product.seller}</p>
                </div>
  
                <div className="flex">
                  <p className="w-24 text-slate-500">Category</p>
                  <p className="font-medium text-slate-800">
                    {product.category.length ? product.category.join(", ") : "-"}
                  </p>
                </div>
  
                <div className="flex">
                  <p className="w-24 text-slate-500">Stock</p>
                  <p className="font-medium text-slate-800">
                    {outOfStock ? "Unavailable" : `${product.stockQuantity} available`}
                  </p>
                </div>
              </div>
  
              <ProductPurchasePanel stockQuantity={product.stockQuantity} />
            </div>
          </div>
        </div>
  
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Product Description
          </h2>
  
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {product.description || "No description provided."}
          </p>
        </div>
      </div>
    </main>
  </>
  );
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-10 text-center text-slate-600">
          Loading product...
        </main>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}