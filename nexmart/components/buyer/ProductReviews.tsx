"use client";

import { useMemo, useState } from "react";
import { RatingStars } from "@/components/rating-star";
import ReviewForm from "./ReviewForm";

type Review = {
  id: number;
  username: string;
  rating: number;
  comment: string;
  date: string;
};

const initialReviews: Review[] = [
  {
    id: 1,
    username: "buyer_amy",
    rating: 5,
    comment: "Good product quality and fast delivery.",
    date: "2026-05-18",
  },
  {
    id: 2,
    username: "buyer_john",
    rating: 4,
    comment: "The item matches the description. Overall satisfied.",
    date: "2026-05-17",
  },
];

type ProductReviewsProps = {
  productRating: number;
};

export default function ProductReviews({ productRating }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return productRating;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews, productRating]);

  function handleSubmitReview(review: { rating: number; comment: string }) {
    const newReview: Review = {
      id: Date.now(),
      username: "Current Buyer",
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().slice(0, 10),
    };

    setReviews((current) => [newReview, ...current]);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Customer Reviews
          </h2>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-teal-700">
              {averageRating}
            </span>
            <RatingStars rating={averageRating} size={18} />
            <span className="text-sm text-slate-500">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>
      </div>

      <ReviewForm onSubmitReview={handleSubmitReview} />

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-100 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {review.username}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-xs text-slate-500">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{review.date}</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}