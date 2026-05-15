"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApprovalActionsProps = {
  productId: number;
};

export default function ApprovalActions({ productId }: ApprovalActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    const confirmed = confirm("Approve this product listing?");

    if (!confirmed) {
      return;
    }

    setIsApproving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "PATCH",
      });

      if (!res.ok) {
        let errorMessage = "Failed to approve product.";

        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Keep default error message
        }

        alert(errorMessage);
        return;
      }

      alert("Product approved successfully.");
      router.refresh();
    } catch {
      alert("Failed to approve product.");
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isApproving}
        className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isApproving ? "Approving..." : "Approve"}
      </button>

      <button
        type="button"
        className="rounded-xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
        onClick={() => alert("Reject action will be added next.")}
      >
        Reject
      </button>
    </div>
  );
}