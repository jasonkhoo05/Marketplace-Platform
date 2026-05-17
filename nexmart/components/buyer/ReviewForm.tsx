"use client";

import { useState } from "react";

type ReviewFormProps = {
  onSubmitReview: (review: {
    rating: number;
    comment: string;
  }) => void;
};

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!comment.trim()) return;

    onSubmitReview({
      rating,
      comment: comment.trim(),
    });

    setRating(5);
    setComment("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Write a Review</h3>

      <div className="mt-4">
        <label className="text-sm text-slate-500">Rating</label>

        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
        >
          <option value={5}>5 stars</option>
          <option value={4}>4 stars</option>
          <option value={3}>3 stars</option>
          <option value={2}>2 stars</option>
          <option value={1}>1 star</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="text-sm text-slate-500">Comment</label>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience with this product..."
          className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
        />
      </div>

      <button
        type="submit"
        className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Submit Review
      </button>
    </form>
  );
}