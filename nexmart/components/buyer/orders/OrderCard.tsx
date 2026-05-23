"use client";

import { useState } from "react";
import type { MockOrder } from "@/types/checkout";
import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";

type Props = {
  order: MockOrder;
  onDelete: (orderId: string) => void;
};

export default function OrderCard({ order, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-bold text-slate-900">
              Order #{order.id}
            </h2>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              {order.status}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {new Date(order.orderDate).toLocaleDateString()} · {order.productName} · Qty:{" "}
            {order.quantity}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <p className="text-base font-bold text-teal-700">
            ${order.totalPrice.toFixed(2)}
          </p>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Details
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Buyer" value={order.buyerName} />
            <Info label="Email" value={order.buyerEmail} />
            <Info label="Product" value={order.productName} />
            <Info label="Quantity" value={String(order.quantity)} />
            <Info
              label="Payment Method"
              value={formatPaymentMethod(order.paymentMethod)}
            />

            <div className="md:col-span-2">
              <Info label="Shipping Address" value={order.buyerAddress} />
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onDelete(order.id)}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function formatPaymentMethod(value: string) {
  if (value === "google_pay") return "Google Pay";
  return value;
}