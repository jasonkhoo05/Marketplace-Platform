"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FlagTriangleRight,
  VenusAndMars,
  Package,
  Tag,
  User,
  DollarSign,
  Layers,
} from "lucide-react";

export type ModerationStatus = "pending" | "approved" | "rejected";
export type ModerationType = "product" | "user" | "review" | "report";

export interface ModerationRequest {
  id: string;
  type: ModerationType;
  status: ModerationStatus;
  details: any;
  created_at: string;
}

interface SectionCardProps {
  title: string;
  icon: any;
  items: ModerationRequest[];
  type: ModerationType;
  onAction: (id: string, status: "approved" | "rejected", reason?: string) => void;
  isLoading: boolean;
  totalCount?: number;
}

function InfoRow({ icon: Icon, label, value, mono = false }: {
  icon: any; label: string; value: string; mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-0.5 text-sm text-slate-800 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function UserDetailModal({ user, onClose }: { user: ModerationRequest; onClose: () => void }) {
  const d = user.details;
  const formattedDateOfBirth = d.date_of_birth
    ? new Date(d.date_of_birth).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
    : "None";
  const roleBadgeClass = (role: string) =>
    role === "admin" ? "bg-purple-100 text-purple-700"
      : role === "seller" ? "bg-teal-100 text-teal-700"
        : "bg-blue-100 text-blue-700";
  const allRoles: string[] = d.roles?.length ? [...new Set(d.roles as string[])] : [d.role || "buyer"];



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">User Details</h2>
            <p className="mt-1 text-sm text-slate-500">Full profile information for this registered account.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 mb-6">
          {d.user_image ? (
            <img src={d.user_image} alt={`${d.username || "User"} profile picture`} className="h-14 w-14 shrink-0 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold shrink-0">
              {d.username ? d.username.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">{d.username || "Unknown"}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {allRoles.map((role) => (
                <span key={role} className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeClass(role)}`}>{role}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow icon={Mail} label="Email" value={d.email || "—"} />
          <InfoRow icon={Phone} label="Phone" value={d.phone || "None"} />
          <InfoRow icon={VenusAndMars} label="Gender" value={d.gender || "None"} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formattedDateOfBirth} />
          <InfoRow icon={MapPin} label="Address" value={d.address || "None"} />
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({
  product,
  onClose,
  onApprove,
  onReject,
}: {
  product: ModerationRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const d = product.details;
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isActing, setIsActing] = useState(false);

  const handleApprove = async () => {
    setIsActing(true);
    await onApprove();
    setIsActing(false);
    onClose();
  };

  const handleReject = async () => {
    setIsActing(true);
    await onReject(rejectionReason);
    setIsActing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Product Details</h2>
            <p className="mt-1 text-sm text-slate-500">Review this pending product listing before approving or rejecting.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {/* Product image */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {d.image ? (
            <img src={d.image} alt={d.title || "Product"} className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-300">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-semibold text-yellow-700">Pending Review</span>
        </div>

        <div className="space-y-4">
          <InfoRow icon={Package} label="Product Name" value={d.title || "—"} />
          <InfoRow icon={Tag} label="Description" value={d.description || "No description"} />
          <InfoRow icon={User} label="Seller" value={d.seller || "Unknown seller"} />
          <InfoRow icon={DollarSign} label="Price" value={d.price !== undefined ? `RM ${Number(d.price).toFixed(2)}` : "—"} />
        </div>

        {/* Reject reason form */}
        {showRejectForm && (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-800">Rejection Reason</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Example: Product image is unclear or inappropriate."
              className="min-h-[80px] w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
          <div className="flex gap-3">
            {!showRejectForm ? (
              <>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isActing}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isActing}
                  className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition disabled:opacity-50"
                >
                  {isActing ? "Approving…" : "Approve"}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowRejectForm(false)} disabled={isActing} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={isActing}
                  className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isActing ? "Rejecting…" : "Confirm Reject"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewDetailModal({
  review,
  onClose,
  onApprove,
  onReject,
}: {
  review: ModerationRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const d = review.details;
  const [isActing, setIsActing] = useState(false);

  const handleApprove = async () => {
    setIsActing(true);
    await onApprove();
    setIsActing(false);
    onClose();
  };

  const handleReject = async () => {
    setIsActing(true);
    await onReject();
    setIsActing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Review Details</h2>
            <p className="mt-1 text-sm text-slate-500">Approve to delete this flagged review, or reject to keep it.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {d.productImage ? (
            <img src={d.productImage} alt={d.productName || "Product"} className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-300">
              <FlagTriangleRight className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-semibold text-rose-700">Flagged Review</span>
        </div>

        <div className="space-y-4">
          <InfoRow icon={Package} label="Product" value={d.productName || "Unknown product"} />
          <InfoRow icon={User} label="Reviewer" value={d.username || "Unknown user"} />
          <InfoRow icon={FlagTriangleRight} label="Review" value={d.review || "No review text"} />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isActing}
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
            >
              {isActing ? "Rejecting..." : "Reject"}
            </button>
            <button
              onClick={handleApprove}
              disabled={isActing}
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition disabled:opacity-50"
            >
              {isActing ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  items,
  type,
  onAction,
  isLoading = false,
  totalCount,
}: SectionCardProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<ModerationRequest | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ModerationRequest | null>(null);
  const [selectedReview, setSelectedReview] = useState<ModerationRequest | null>(null);

  const colorMap = {
    product: { icon: "text-teal-700", badgeBg: "bg-teal-50", badgeText: "text-teal-700", footerHover: "hover:bg-teal-50", footerText: "text-teal-700", borderTop: "border-t-teal-500" },
    user: { icon: "text-blue-600", badgeBg: "bg-blue-50", badgeText: "text-blue-600", footerHover: "hover:bg-blue-50", footerText: "text-blue-600", borderTop: "border-t-blue-500" },
    review: { icon: "text-rose-600", badgeBg: "bg-rose-50", badgeText: "text-rose-600", footerHover: "hover:bg-rose-50", footerText: "text-rose-600", borderTop: "border-t-rose-500" },
    report: { icon: "text-rose-600", badgeBg: "bg-rose-50", badgeText: "text-rose-600", footerHover: "hover:bg-rose-50", footerText: "text-rose-600", borderTop: "border-t-rose-500" },
  };

  const colors = colorMap[type];
  const badgeCount = totalCount !== undefined && type === "user" ? totalCount : items.length;

  const navigateUserManagement = () => {
    router.push("/admin/moderation/usermanagement");
  }

  const viewAllHref: Record<ModerationType, string> = {
    product: "/admin/approval",
    user: "/admin/moderation/usermanagement",
    review: "/admin/reviews",
    report: "#",  // /admin/reportcontent
  };

  // Approve
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/approve`, { method: "PATCH" });
      if (res.ok) {
        onAction(id, "approved");
        router.refresh();
      } else {
        console.error("Approve failed:", await res.text());
      }
    } catch (e) {
      console.error("Approve error:", e);
    }
  };

  // Reject
  const handleReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prod_rejection_reason: reason }),
      });
      if (res.ok) {
        onAction(id, "rejected");
        router.refresh();
      } else {
        console.error("Reject failed:", await res.text());
      }
    } catch (e) {
      console.error("Reject error:", e);
    }
  };

  const handleDeleteReview = async (item: ModerationRequest) => {
    const { prodId, userId } = item.details;

    try {
      const reviewUrl = `/api/admin/reviews/${prodId}/${encodeURIComponent(userId)}`;
      const approveRes = await fetch(reviewUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: "y" }),
      });

      if (!approveRes.ok) {
        console.error("Review delete approval failed:", await approveRes.text());
        return;
      }

      const deleteRes = await fetch(reviewUrl, { method: "DELETE" });
      if (deleteRes.ok) {
        onAction(item.id, "approved");
        router.refresh();
      } else {
        console.error("Review delete failed:", await deleteRes.text());
      }
    } catch (e) {
      console.error("Review delete error:", e);
    }
  };

  const handleKeepReview = async (item: ModerationRequest) => {
    const { prodId, userId } = item.details;

    try {
      const res = await fetch(
        `/api/admin/reviews/${prodId}/${encodeURIComponent(userId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flag: "n" }),
        },
      );

      if (res.ok) {
        onAction(item.id, "rejected");
        router.refresh();
      } else {
        console.error("Review keep failed:", await res.text());
      }
    } catch (e) {
      console.error("Review keep error:", e);
    }
  };

  return (
    <>
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onApprove={() => handleApprove(selectedProduct.id)}
          onReject={(reason) => handleReject(selectedProduct.id, reason)}
        />
      )}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={() => handleDeleteReview(selectedReview)}
          onReject={() => handleKeepReview(selectedReview)}
        />
      )}

      <div className={`flex flex-col h-full rounded-2xl border border-slate-200 border-t-4 ${colors.borderTop} bg-white shadow-sm overflow-hidden transition-all hover:shadow-md`}>
        <div className="flex flex-row items-center justify-between border-b border-slate-100 p-5 bg-white">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colors.icon}`} />
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <div className={`flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
            {badgeCount} {type === "user" ? "Accounts" : "Pending"}
          </div>
        </div>

        <div className="p-0 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-muted-foreground space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
              <p className="text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">

                      {type === "user" && (
                        <>
                          {item.details.user_image ? (
                            <img src={item.details.user_image} alt={`${item.details.username || "User"} profile`} className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                              {item.details.username ? item.details.username.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                        </>
                      )}

                      {type === "product" && (
                        <>
                          {item.details.image ? (
                            <img src={item.details.image} alt={item.details.title || "Product"} className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </>
                      )}

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {type === "product" && item.details.title}
                          {type === "user" && item.details.username}
                          {type === "review" && `${item.details.username} on ${item.details.productName}`}
                          {type === "report" && item.details.report_reason}
                        </p>

                        {type === "product" ? (
                          <>
                            <p className="text-xs text-slate-400 truncate">By {item.details.seller || "Unknown seller"}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{item.details.description || "No description"}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {type === "user" ? (
                              item.details.email || "No email"
                            ) : type === "review" ? (
                              item.details.review || "No review text"
                            ) : (
                              item.details.description ||
                              item.details.reason ||
                              item.details.reported_by ||
                              "No details provided"
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          if (type === "user") setSelectedUser(item);
                          else if (type === "product") setSelectedProduct(item);
                          else if (type === "review") setSelectedReview(item);
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 bg-white">
          <a
            href={viewAllHref[type]}
            className={`w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 group ${colors.footerText} ${colors.footerHover}`}
          >
            View all {title}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </>
  );
}
