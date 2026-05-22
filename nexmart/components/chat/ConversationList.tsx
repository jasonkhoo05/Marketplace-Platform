"use client";

import { Conversation } from "@/lib/types/chat";
import { MessageCircle } from "lucide-react";

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (conv: Conversation) => void;
  loading: boolean;
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#185fa5] to-[#1d9e75]">
          <MessageCircle size={24} className="text-white" />
        </div>
        <p className="text-sm font-medium text-slate-700">No conversations yet</p>
        <p className="text-xs text-slate-400">Message a seller from a product page</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
            selectedId === conv.id ? "bg-teal-50 border-l-2 border-teal-600" : ""
          }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {conv.other_user_image ? (
              <img
                src={conv.other_user_image}
                alt={conv.other_user_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#185fa5] to-[#1d9e75] text-sm font-bold text-white">
                {conv.other_user_name.charAt(0).toUpperCase()}
              </div>
            )}
            {conv.unread_count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {conv.unread_count > 9 ? "9+" : conv.unread_count}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`truncate text-sm ${conv.unread_count > 0 ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                {conv.other_user_name}
              </span>
              <span className="ml-2 flex-shrink-0 text-[11px] text-slate-400">
                {timeAgo(conv.last_message_at)}
              </span>
            </div>
            {conv.product_name && (
              <p className="truncate text-[11px] text-teal-600">{conv.product_name}</p>
            )}
            <p className={`truncate text-xs ${conv.unread_count > 0 ? "font-medium text-slate-700" : "text-slate-400"}`}>
              {conv.last_message ?? "Start a conversation"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
