import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ApprovalActions from "@/components/admin/ApprovalActions";
import { Suspense } from "react";

type ProductCategoryRow = {
  prod_cat_name: string | null;
};

type ProductCatLinkRow = {
  prod_cat_id: number;
  product_category_type?: ProductCategoryRow | ProductCategoryRow[] | null;
};

type SellerRow = {
  username: string | null;
  email?: string | null;
};

type PendingProductRow = {
  prod_id: number;
  prod_name: string;
  prod_desc: string | null;
  prod_price: number | string;
  prod_stock_qty: number | string;
  prod_image: string | null;
  prod_status: "pending" | "approved" | "hidden";
  prod_rejection_reason: string | null;
  prod_created_at: string | null;
  prod_cat_link?: ProductCatLinkRow[] | null;
  user?: SellerRow | SellerRow[] | null;
};

function getCategoryNames(product: PendingProductRow): string {
  const categories =
    product.prod_cat_link?.flatMap((link) => {
      const category = link.product_category_type;

      if (!category) {
        return [];
      }

      if (Array.isArray(category)) {
        return category
          .map((item) => item.prod_cat_name)
          .filter((name): name is string => Boolean(name));
      }

      return category.prod_cat_name ? [category.prod_cat_name] : [];
    }) ?? [];

  return categories.length > 0 ? categories.join(", ") : "Uncategorised";
}

function getSellerName(product: PendingProductRow): string {
  const seller = Array.isArray(product.user) ? product.user[0] : product.user;
  return seller?.username ?? "Unknown seller";
}

export async function AdminApprovalContent() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("product")
    .select(
      `
        prod_id,
        prod_name,
        prod_desc,
        prod_price,
        prod_stock_qty,
        prod_image,
        prod_status,
        prod_rejection_reason,
        prod_created_at,
        prod_cat_link!prod_cat_link_prod_fk(
          prod_cat_id,
          product_category_type!prod_cat_link_prod_cat_fk(
            prod_cat_name
          )
        ),
        user!product_seller_uuid_fkey(
          username
        )
      `,
    )
    .eq("prod_status", "pending")
    .order("prod_created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-white p-6 text-red-600 shadow-sm">
          Failed to load pending products: {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Admin Moderation
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Product Approval
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review pending seller listings before they appear to buyers.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Pending Listings
            </h2>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              {products?.length ?? 0} pending
            </span>
          </div>

          {!products || products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <p className="font-semibold text-slate-700">
                No pending products
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New seller listings will appear here for admin review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-4">Product</th>
                    <th className="px-3 py-4">Seller</th>
                    <th className="px-3 py-4">Category</th>
                    <th className="px-3 py-4">Price</th>
                    <th className="px-3 py-4">Stock</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(products as PendingProductRow[]).map((product) => (
                    <tr
                      key={product.prod_id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.prod_image ||
                              "/products/placeholder.jpg"
                            }
                            alt={product.prod_name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />

                          <div>
                            <p className="font-semibold text-slate-900">
                              {product.prod_name}
                            </p>
                            <p className="line-clamp-2 max-w-xs text-xs text-slate-500">
                              {product.prod_desc || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {getSellerName(product)}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {getCategoryNames(product)}
                      </td>

                      <td className="px-3 py-4 text-sm font-bold text-slate-900">
                        ${Number(product.prod_price).toFixed(2)}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {Number(product.prod_stock_qty)}
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Pending
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <ApprovalActions productId={product.prod_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


export default function AdminApprovalPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Loading pending products...
            </p>
          </div>
        </main>
      }
    >
      <AdminApprovalContent />
    </Suspense>
  );
}