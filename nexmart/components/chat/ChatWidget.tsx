"use client";

import { useEffect, useRef, useState } from "react";
import { Conversation } from "@/lib/types/chat";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";

const MOCK_USER_ID = "mock-me-123";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    buyer_uuid: MOCK_USER_ID,
    seller_uuid: "seller-1",
    product_id: "prod-1",
    product_name: "Wireless Noise-Cancelling Headphones",
    product_image: null,
    other_user_name: "TechStore SG",
    other_user_image: null,
    last_message: "Yes, it comes with a 1-year warranty!",
    last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unread_count: 2,
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    buyer_uuid: MOCK_USER_ID,
    seller_uuid: "seller-2",
    product_id: "prod-2",
    product_name: "Mechanical Keyboard RGB",
    product_image: null,
    other_user_name: "GadgetHub",
    other_user_image: null,
    last_message: "We can ship tomorrow if you order before 3pm.",
    last_message_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    unread_count: 0,
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: "conv-3",
    buyer_uuid: MOCK_USER_ID,
    seller_uuid: "seller-3",
    product_id: "prod-3",
    product_name: "Running Shoes - Size 9",
    product_image: null,
    other_user_name: "SportZone",
    other_user_image: null,
    last_message: "Hi, is this still available?",
    last_message_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    unread_count: 1,
    created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalUnread = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread_count, 0);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Chat Panel */}
      {open && (
        <div
          className="absolute bottom-16 right-0 flex flex-col overflow-hidden rounded-2xl bg-white"
          style={{
            width: 360,
            height: 520,
            boxShadow: "0 8px 40px rgba(29, 158, 117, 0.18), 0 2px 12px rgba(0,0,0,0.10)",
            border: "1px solid rgba(29, 158, 117, 0.15)",
          }}
        >
          {/* Panel Header */}
          <div className="grad flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {selectedConv && (
                <button
                  onClick={() => setSelectedConv(null)}
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <MessageCircle size={18} className="text-white" />
              <span className="text-sm font-semibold text-white">
                {selectedConv ? selectedConv.other_user_name : "Messages"}
              </span>
            </div>
            <button
              onClick={() => { setOpen(false); setSelectedConv(null); }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden">
            {selectedConv ? (
              <MessageThread
                conversation={selectedConv}
                currentUserId={MOCK_USER_ID}
                onBack={() => setSelectedConv(null)}
              />
            ) : (
              <ConversationList
                conversations={MOCK_CONVERSATIONS}
                selectedId={null}
                currentUserId={MOCK_USER_ID}
                onSelect={(conv) => setSelectedConv(conv)}
                loading={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) setSelectedConv(null); }}
        aria-label="Open chat"
        className="grad relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ boxShadow: "0 4px 20px rgba(29, 158, 117, 0.4)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}

        {!open && totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white ring-2 ring-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
