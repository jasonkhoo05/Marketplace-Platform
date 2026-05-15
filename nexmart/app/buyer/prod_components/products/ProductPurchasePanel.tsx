"use client";

import { useState } from "react";

type Props = {
  stockQuantity: number;
};

export default function ProductPurchasePanel({ stockQuantity }: Props) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stockQuantity === 0;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stockQuantity, current + 1));
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-6">
        <p className="w-24 text-sm text-slate-500">Quantity</p>

        <div className="flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={outOfStock || quantity === 1}
            className="px-4 py-2 text-slate-600 disabled:text-slate-300"
          >
          </button>

          <span className="min-w-12 border-x border-slate-200 px-4 py-2 text-center text-sm">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={outOfStock || quantity === stockQuantity}
            className="px-4 py-2 text-slate-600 disabled:text-slate-300"
          >
            +
          </button>
        </div>

        <p className="text-sm text-slate-500">
          {stockQuantity} available
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          disabled={outOfStock}
          className="flex-1 rounded-xl border border-teal-700 bg-teal-50 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          Add to Cart
        </button>

        <button
          type="button"
          disabled={outOfStock}
          className="flex-1 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}