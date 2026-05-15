"use client";

import { CheckCircle2, XCircle, Eye, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function SectionCard({
  title,
  icon: Icon,
  items,
  type,
  onAction,
  isLoading = false,
}: SectionCardProps) {
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

  return (
    <div className={`flex flex-col h-full rounded-2xl border border-slate-200 border-t-4 ${colors.borderTop} bg-white shadow-sm overflow-hidden transition-all hover:shadow-md`}>
      <div className="flex flex-row items-center justify-between border-b border-slate-100 p-5 bg-white">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <div className={`flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
          {items.length} {type === "user" ? "New" : "Pending"}
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
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {type === "product" && item.details.title}
                      {type === "user" && item.details.username}
                      {type === "report" && item.details.report_reason}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {item.details.description || item.details.email || item.details.reason || item.details.reported_by || "No details provided"}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 block">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => alert(`Viewing details for ${item.id}`)}
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
        <button className={`w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 group ${colors.footerText} ${colors.footerHover}`}>
          View all {title}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
