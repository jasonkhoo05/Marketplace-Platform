import ProductPurchasePanel from "@/components/buyer/products/ProductPurchasePanel";
import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import ProductReviews from "@/components/buyer/ProductReviews";
import { RatingStars } from "@/components/rating-star";
import { createClient } from "@/lib/supabase/server";
import { productFromRow, type ProductRow } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FiChevronLeft } from "react-icons/fi";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function ProductUnavailableMessage() {
  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-10 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            This product is no longer available.
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            The product listing may have been removed, hidden, not approved, or
            it may no longer exist.
          </p>

          <Link
            href="/buyer/products"
            className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Back to products
          </Link>
        </div>
      </main>
    </>
  );
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return <ProductUnavailableMessage />;
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
      user!product_seller_uuid_fkey(username,user_uuid)
    `)
    .eq("prod_id", numericId)
    .maybeSingle();

  if (error || !row) {
    return <ProductUnavailableMessage />;
  }

  const product = productFromRow(row as unknown as ProductRow);
  const outOfStock = product.stockQuantity === 0;

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-10 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Link
            href="/buyer/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors"
          >
            <FiChevronLeft size={16} />
            Back to products
          </Link>

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
                    className="object-contain"
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
                    <p className="font-medium text-slate-800">
                      {product.seller}
                    </p>
                  </div>

                  <div className="flex">
                    <p className="w-24 text-slate-500">Category</p>
                    <p className="font-medium text-slate-800">
                      {product.category.length
                        ? product.category.join(", ")
                        : "-"}
                    </p>
                  </div>

                  <div className="flex">
                    <p className="w-24 text-slate-500">Stock</p>
                    <p className="font-medium text-slate-800">
                      {outOfStock
                        ? "Unavailable"
                        : `${product.stockQuantity} available`}
                    </p>
                  </div>
                </div>

                <ProductPurchasePanel product={product} />
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

          <ProductReviews productId={product.id} productRating={product.rating} />
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