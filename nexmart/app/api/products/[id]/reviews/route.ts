import { NextRequest, NextResponse } from "next/server";
import {
  buildReviewsResponse,
  mapReviewRows,
  PRODUCT_REVIEW_SELECT,
  type ProductReviewRow,
} from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CreateReviewBody = {
  rating?: number;
  comment?: string;
  anonymous?: boolean;
};

const MAX_REVIEW_LENGTH = 500;

function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}

function getValidProductId(id: string): number | null {
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

function isValidRating(rating: unknown): rating is number {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

async function fetchProductReviews(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: number,
) {
  const { data, error } = await supabase
    .from("product_review")
    .select(PRODUCT_REVIEW_SELECT)
    .eq("prod_id", productId)
    .order("created_at", { ascending: false })
    .limit(200); // TODO: Replace with cursor-based pagination in next milestone

  if (error) {
    throw new Error(error.message);
  }

  return mapReviewRows(data as ProductReviewRow[] | null);
}

async function syncProductRating(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: number,
) {
  const { data: ratingRows, error: ratingError } = await supabase
    .from("product_review")
    .select("review_rating")
    .eq("prod_id", productId);

  if (ratingError) {
    throw new Error(ratingError.message);
  }

  const ratings = (ratingRows ?? []).map((row) =>
    typeof row.review_rating === "string"
      ? Number(row.review_rating)
      : row.review_rating,
  );

  const averageRating =
    ratings.length === 0
      ? 0
      : Number(
          (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1),
        );

  // Buyers usually cannot UPDATE product under RLS (no error, zero rows updated).
  // Database trigger sync_product_rating_from_reviews keeps prod_rating in sync.
  const { error: updateError } = await supabase
    .from("product")
    .update({ prod_rating: averageRating })
    .eq("prod_id", productId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return averageRating;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const productId = getValidProductId(id);

  if (productId === null) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const reviews = await fetchProductReviews(supabase, productId);

    return NextResponse.json(buildReviewsResponse(reviews));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load reviews.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const productId = getValidProductId(id);

  if (productId === null) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as CreateReviewBody;
    const comment = body.comment?.trim() ?? "";

    if (!isValidRating(body.rating)) {
      return NextResponse.json(
        { error: "Rating must be a whole number from 1 to 5." },
        { status: 400 },
      );
    }

    if (comment.length === 0) {
      return NextResponse.json(
        { error: "Review comment cannot be empty." },
        { status: 400 },
      );
    }

    if (comment.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json(
        {
          error: `Review comment must be ${MAX_REVIEW_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    const { data: product, error: productError } = await supabase
      .from("product")
      .select("prod_id")
      .eq("prod_id", productId)
      .maybeSingle();

    if (productError) {
      throw new Error(productError.message);
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const { error: insertError } = await supabase.from("product_review").insert({
      prod_id: productId,
      user_uuid: user.id,
      review: comment,
      review_rating: body.rating,
      is_anonymous: body.anonymous === true,
      flag: "n",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You have already reviewed this product." },
          { status: 409 },
        );
      }

      throw new Error(insertError.message);
    }

    await syncProductRating(supabase, productId);

    const reviews = await fetchProductReviews(supabase, productId);

    return NextResponse.json(
      {
        message: "Review submitted successfully.",
        ...buildReviewsResponse(reviews),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit review.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
