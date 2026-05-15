"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApprovalActionsProps = {
  productId: number;
};

export default function ApprovalActions({ productId }: ApprovalActionsProps) {
  const router = useRouter();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleApprove() {
    setErrorMessage("");
    setIsApproving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "PATCH",
      });

      if (!res.ok) {
        let message = "Failed to approve product.";

        try {
          const errorData = await res.json();
          message = errorData.error || message;
        } catch {
          // Keep default message
        }

        setErrorMessage(message);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Failed to approve product.");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setErrorMessage("");
    setIsRejecting(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prod_rejection_reason: rejectionReason,
        }),
      });

      if (!res.ok) {
        let message = "Failed to reject product.";

        try {
          const errorData = await res.json();
          message = errorData.error || message;
        } catch {
          // Keep default message
        }

        setErrorMessage(message);
        return;
      }

      setIsRejectFormOpen(false);
      setRejectionReason("");
      router.refresh();
    } catch {
      setErrorMessage("Failed to reject product.");
    } finally {
      setIsRejecting(false);
    }
  }

  function closeRejectForm() {
    if (isRejecting) {
      return;
    }

    setIsRejectFormOpen(false);
    setRejectionReason("");
    setErrorMessage("");
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApproving ? "Approving..." : "Approve"}
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setIsRejectFormOpen(true);
            }}
            disabled={isApproving || isRejecting}
            className="rounded-xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reject
          </button>
        </div>

        {errorMessage && (
          <p className="max-w-[180px] text-xs text-red-600">{errorMessage}</p>
        )}
      </div>

      {isRejectFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Reject Product Listing
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter a rejection reason for the seller. You may leave this blank.
              </p>
            </div>

            <label
              htmlFor={`rejection-reason-${productId}`}
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rejection Reason
            </label>

            <textarea
              id={`rejection-reason-${productId}`}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Example: Product image is unclear or inappropriate."
              className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />

            {errorMessage && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectForm}
                disabled={isRejecting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Reject Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}