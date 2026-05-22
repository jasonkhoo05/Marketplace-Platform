export type ProductReview = {
  id: number;
  productId: number;
  username: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  date: string;
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
};

type UserEmbed = {
  username: string | null;
};

export type ProductReviewRow = {
  prod_id: number;
  user_uuid: string;
  review: string;
  review_rating: number | string;
  is_anonymous: boolean;
  created_at: string;
  user?: UserEmbed | UserEmbed[] | null;
};

export const PRODUCT_REVIEW_SELECT = `
  prod_id,
  user_uuid,
  review,
  review_rating,
  is_anonymous,
  created_at,
  user!product_review_user_uuid_fkey (username)
`;

function toNumber(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

function formatReviewDate(createdAt: string): string {
  return createdAt.slice(0, 10);
}

function reviewIdFromRow(row: ProductReviewRow): number {
  return new Date(row.created_at).getTime();
}

export function mapReviewRows(rows: ProductReviewRow[] | null): ProductReview[] {
  if (!rows?.length) {
    return [];
  }

  return rows.map((row) => {
    const user = Array.isArray(row.user) ? row.user[0] : row.user;

    return {
      id: reviewIdFromRow(row),
      productId: row.prod_id,
      username: row.is_anonymous
        ? "Anonymous Buyer"
        : (user?.username ?? "Buyer"),
      rating: toNumber(row.review_rating),
      comment: row.review,
      anonymous: row.is_anonymous,
      date: formatReviewDate(row.created_at),
    };
  });
}

export function calculateReviewSummary(
  reviews: ProductReview[],
): ReviewSummary {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
  };
}

export function buildReviewsResponse(reviews: ProductReview[]) {
  return {
    reviews,
    ...calculateReviewSummary(reviews),
  };
}
