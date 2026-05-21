"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "@/components/rating-star";
import ReviewForm from "./ReviewForm";

type Review = {
  id: number;
  productId: number;
  username: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  date: string;
};

type ReviewsApiResponse = {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  message?: string;
  error?: string;
};

type ProductReviewsProps = {
  productId: number;
  productRating: number;
};

export default function ProductReviews({
  productId,
  productRating,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(productRating);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/products/${productId}/reviews`);
        const data = (await response.json()) as ReviewsApiResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load reviews.");
        }

        setReviews(data.reviews);
        setTotalReviews(data.totalReviews);
        setAverageRating(
          data.totalReviews > 0 ? data.averageRating : productRating,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load reviews.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadReviews();
  }, [productId, productRating]);

  async function handleSubmitReview(review: {
    rating: number;
    comment: string;
    anonymous: boolean;
  }) {
    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
      });

      const data = (await response.json()) as ReviewsApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit review.");
      }

      setReviews(data.reviews);
      setTotalReviews(data.totalReviews);
      setAverageRating(data.averageRating);
      setSuccessMessage(data.message ?? "Review submitted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit review.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
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
              {averageRating.toFixed(1)}
            </span>
            <RatingStars rating={averageRating} size={18} />
            <span className="text-sm text-slate-500">
              ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
      </div>

      <ReviewForm
        onSubmitReview={handleSubmitReview}
        isSubmitting={isSubmitting}
      />

      {successMessage && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-slate-100 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {review.anonymous ? "Anonymous Buyer" : review.username}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={review.rating} size={14} />
                    <span className="text-xs text-slate-500">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                <p className="shrink-0 text-xs text-slate-400">{review.date}</p>
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