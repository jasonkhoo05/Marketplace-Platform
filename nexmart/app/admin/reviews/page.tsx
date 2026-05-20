import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import ReviewActions from "@/components/admin/ReviewActions";

type ProductRow = {
  prod_name: string | null;
  prod_image: string | null;
};

type UserRow = {
  username: string | null;
};

type FlaggedReviewRow = {
  prod_id: number | string;
  user_uuid: string;
  review: string | null;
  flag: string | null;
  product?: ProductRow | ProductRow[] | null;
  user?: UserRow | UserRow[] | null;
};

function getProduct(review: FlaggedReviewRow): ProductRow | null {
  return Array.isArray(review.product) ? review.product[0] ?? null : review.product ?? null;
}

function getUser(review: FlaggedReviewRow): UserRow | null {
  return Array.isArray(review.user) ? review.user[0] ?? null : review.user ?? null;
}

async function AdminReviewsContent() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("product_review")
    .select(
      `
        prod_id,
        user_uuid,
        review,
        flag,
        product:product(
          prod_name,
          prod_image
        ),
        user:user(
          username
        )
      `,
    )
    .eq("flag", "f")
    .order("prod_id", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-white p-6 text-red-600 shadow-sm">
        Failed to load flagged reviews: {error.message}
      </div>
    );
  }

  const flaggedReviews = (reviews ?? []) as FlaggedReviewRow[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Review Approval
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review flagged product reviews before deleting them from the marketplace.
          </p>
        </div>

        <Link
          href="/admin/moderation"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
        >
          Back to Moderation
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Flagged Reviews
          </h2>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            {flaggedReviews.length} pending
          </span>
        </div>

        {flaggedReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="font-semibold text-slate-700">
              No flagged reviews
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Flagged product reviews will appear here for admin review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Reviewer</th>
                  <th className="px-3 py-4">Review</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {flaggedReviews.map((review) => {
                  const product = getProduct(review);
                  const user = getUser(review);

                  return (
                    <tr
                      key={`${review.prod_id}-${review.user_uuid}`}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product?.prod_image || "/products/placeholder.jpg"}
                            alt={product?.prod_name || "Product"}
                            className="h-14 w-14 rounded-xl object-cover"
                          />

                          <p className="font-semibold text-slate-900">
                            {product?.prod_name || "Unknown product"}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {user?.username || "Unknown user"}
                      </td>

                      <td className="px-3 py-4">
                        <p className="max-w-md text-sm text-slate-700">
                          {review.review || "No review text"}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                          Flagged
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <ReviewActions
                          prodId={Number(review.prod_id)}
                          userId={review.user_uuid}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Loading flagged reviews...
          </p>
        </div>
      }
    >
      <AdminReviewsContent />
    </Suspense>
  );
}
