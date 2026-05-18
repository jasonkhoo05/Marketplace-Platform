"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewActionsProps = {
  prodId: number;
  userId: string;
};

export default function ReviewActions({ prodId, userId }: ReviewActionsProps) {
  const router = useRouter();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function getReviewUrl() {
    return `/api/admin/reviews/${prodId}/${encodeURIComponent(userId)}`;
  }

  async function handleApprove() {
    setErrorMessage("");
    setIsApproving(true);

    try {
      const approveRes = await fetch(getReviewUrl(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: "y" }),
      });

      if (!approveRes.ok) {
        const data = await approveRes.json().catch(() => null);
        setErrorMessage(data?.error || "Failed to approve review deletion.");
        return;
      }

      const deleteRes = await fetch(getReviewUrl(), { method: "DELETE" });

      if (!deleteRes.ok) {
        const data = await deleteRes.json().catch(() => null);
        setErrorMessage(data?.error || "Failed to delete review.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Failed to approve review deletion.");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    setErrorMessage("");
    setIsRejecting(true);

    try {
      const res = await fetch(getReviewUrl(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: "n" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || "Failed to reject review deletion.");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Failed to reject review deletion.");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
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
          onClick={handleReject}
          disabled={isApproving || isRejecting}
          className="rounded-xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRejecting ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {errorMessage && (
        <p className="max-w-[180px] text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
