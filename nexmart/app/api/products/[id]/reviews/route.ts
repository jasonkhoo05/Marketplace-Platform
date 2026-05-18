import { NextRequest, NextResponse } from "next/server";
import {
  calculateMockReviewSummary,
  createMockReview,
  getMockReviewsByProductId,
} from "@/data/mockReviews";

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

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const productId = getValidProductId(id);

  if (productId === null) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const reviews = getMockReviewsByProductId(productId);
  const summary = calculateMockReviewSummary(productId);

  return NextResponse.json({
    reviews,
    ...summary,
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const productId = getValidProductId(id);

  if (productId === null) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

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

  if (comment.length > 500) {
    return NextResponse.json(
      { error: "Review comment must be 500 characters or fewer." },
      { status: 400 },
    );
  }

  // Mock backend only:
  // There is intentionally no database insert here.
  // There is also intentionally no purchase-history check, so users can review
  // even if they have not purchased the product.
  createMockReview({
    productId,
    rating: body.rating,
    comment,
    anonymous: body.anonymous === true,
  });

  const reviews = getMockReviewsByProductId(productId);
  const summary = calculateMockReviewSummary(productId);

  return NextResponse.json(
    {
      message: "Review submitted successfully.",
      reviews,
      ...summary,
    },
    { status: 201 },
  );
}