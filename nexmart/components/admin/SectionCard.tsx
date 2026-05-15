"use client";

import { useState } from "react";
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
  VenusAndMars,
} from "lucide-react";

export type ModerationStatus = "pending" | "approved" | "rejected";
export type ModerationType = "product" | "user" | "report";

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
  onAction: (id: string, status: "approved" | "rejected") => void;
  isLoading: boolean;
  totalCount?: number;
}

function UserDetailModal({
  user,
  onClose,
}: {
  user: ModerationRequest;
  onClose: () => void;
}) {
  const d = user.details;
  const formattedDateOfBirth = d.date_of_birth
    ? new Date(d.date_of_birth).toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "None";
  const roleBadgeClass = (role: string) =>
    role === "admin"
      ? "bg-purple-100 text-purple-700"
      : role === "seller"
        ? "bg-teal-100 text-teal-700"
        : "bg-blue-100 text-blue-700";

  const allRoles: string[] = d.roles?.length
    ? [...new Set(d.roles as string[])]
    : [d.role || "buyer"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">User Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Full profile information for this registered account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 mb-6">
          {d.user_image ? (
            <img
              src={d.user_image}
              alt={`${d.username || "User"} profile picture`}
              className="h-14 w-14 shrink-0 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold shrink-0">
              {d.username ? d.username.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">{d.username || "Unknown"}</p>
            {/* Show ALL roles as separate badges */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {allRoles.map((role) => (
                <span
                  key={role}
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeClass(role)}`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow icon={Mail} label="Email" value={d.email || "—"} />
          <InfoRow icon={Phone} label="Phone" value={d.phone || "None"} />
          <InfoRow icon={VenusAndMars} label="Gender" value={d.gender || "None"} />
          <InfoRow
            icon={Calendar}
            label="Date of Birth"
            value={formattedDateOfBirth}
          />
          <InfoRow
            icon={MapPin}
            label="Address"
            value={d.address || "None"}
          />
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
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

export function SectionCard({
  title,
  icon: Icon,
  items,
  type,
  onAction,
  isLoading = false,
  totalCount,
}: SectionCardProps) {
  const [selectedUser, setSelectedUser] = useState<ModerationRequest | null>(null);

  const colorMap = {
    product: {
      icon: "text-teal-700",
      badgeBg: "bg-teal-50",
      badgeText: "text-teal-700",
      footerHover: "hover:bg-teal-50",
      footerText: "text-teal-700",
      borderTop: "border-t-teal-500",
    },
    user: {
      icon: "text-blue-600",
      badgeBg: "bg-blue-50",
      badgeText: "text-blue-600",
      footerHover: "hover:bg-blue-50",
      footerText: "text-blue-600",
      borderTop: "border-t-blue-500",
    },
    report: {
      icon: "text-rose-600",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-600",
      footerHover: "hover:bg-rose-50",
      footerText: "text-rose-600",
      borderTop: "border-t-rose-500",
    },
  };

  const colors = colorMap[type];
  const badgeCount = totalCount !== undefined && type === "user" ? totalCount : items.length;

  const viewAllHref: Record<ModerationType, string> = {
    product: "/admin/approval",
    user: "#",    // /admin/users
    report: "#",  // /admin/reportcontent
  };

  return (
    <>
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
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
                <li
                  key={item.id}
                  className="p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {type === "user" && (
                        <>
                          {item.details.user_image ? (
                            <img
                              src={item.details.user_image}
                              alt={`${item.details.username || "User"} profile picture`}
                              className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                              {item.details.username
                                ? item.details.username.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}
                        </>
                      )}

                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {type === "product" && item.details.title}
                          {type === "user" && item.details.username}
                          {type === "report" && item.details.report_reason}
                        </p>

                        <p className="text-sm text-slate-500 line-clamp-1">
                          {type === "user"
                            ? item.details.email || "No email"
                            : item.details.description ||
                            item.details.reason ||
                            item.details.reported_by ||
                            "No details provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => type === "user" ? setSelectedUser(item) : alert(`Viewing details for ${item.id}`)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      {type !== "user" && (
                        <>
                          <button
                            onClick={() => onAction(item.id, "approved")}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-emerald-50 text-emerald-600 hover:bg-emerald-100 h-8 w-8"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onAction(item.id, "rejected")}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-50 text-red-600 hover:bg-red-100 h-8 w-8"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
