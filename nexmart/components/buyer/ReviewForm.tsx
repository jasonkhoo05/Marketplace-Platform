"use client";

import { useState } from "react";

type ReviewFormProps = {
  onSubmitReview: (review: {
    rating: number;
    comment: string;
    anonymous: boolean;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
};

export default function ReviewForm({
  onSubmitReview,
  isSubmitting = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setFormError("Please write a review comment before submitting.");
      return;
    }

    setFormError("");

    try {
      await onSubmitReview({
        rating,
        comment: trimmedComment,
        anonymous,
      });

      setRating(5);
      setComment("");
      setAnonymous(false);
    } catch {
      // The parent component displays the API error message.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Write a Review</h3>

      <p className="mt-1 text-xs text-slate-500">
        You can submit a review even if you have not purchased this product.
      </p>

      <div className="mt-4">
        <label htmlFor="review-rating" className="text-sm text-slate-500">
          Rating
        </label>

        <select
          id="review-rating"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value={5}>5 stars</option>
          <option value={4}>4 stars</option>
          <option value={3}>3 stars</option>
          <option value={2}>2 stars</option>
          <option value={1}>1 star</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="review-comment" className="text-sm text-slate-500">
          Comment
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your opinion about this product..."
          disabled={isSubmitting}
          maxLength={500}
          className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <p className="mt-1 text-xs text-slate-400">
          {comment.length}/500 characters
        </p>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-slate-300 accent-teal-700 disabled:cursor-not-allowed"
        />
        Leave this review anonymously
      </label>

      {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}