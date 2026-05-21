export type MockReview = {
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

let mockReviews: MockReview[] = [
  {
    id: 1,
    productId: 1,
    username: "buyer_amy",
    rating: 5,
    comment: "Good product quality and fast delivery.",
    anonymous: false,
    date: "2026-05-18",
  },
  {
    id: 2,
    productId: 1,
    username: "Anonymous Buyer",
    rating: 4,
    comment: "The item matches the description. Overall satisfied.",
    anonymous: true,
    date: "2026-05-17",
  },
  {
    id: 3,
    productId: 2,
    username: "buyer_jason",
    rating: 5,
    comment: "Very useful and exactly what I expected.",
    anonymous: false,
    date: "2026-05-16",
  },
];

export function getMockReviewsByProductId(productId: number): MockReview[] {
  return mockReviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.id - a.id);
}

export function calculateMockReviewSummary(productId: number): ReviewSummary {
  const reviews = getMockReviewsByProductId(productId);

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

export function createMockReview(input: {
  productId: number;
  rating: number;
  comment: string;
  anonymous: boolean;
}): MockReview {
  const review: MockReview = {
    id: Date.now(),
    productId: input.productId,
    username: input.anonymous ? "Anonymous Buyer" : "Current Buyer",
    rating: input.rating,
    comment: input.comment,
    anonymous: input.anonymous,
    date: new Date().toISOString().slice(0, 10),
  };

  mockReviews = [review, ...mockReviews];

  return review;
}