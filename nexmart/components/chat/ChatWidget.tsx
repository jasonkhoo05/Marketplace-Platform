"use client";

import { useEffect, useRef, useState } from "react";
import { chat, chat_message } from "@/lib/types/chat";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { createClient } from "@/lib/supabase/client";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); 
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [messagesMap, setMessagesMap] = useState<Record<number, chat_message[]>>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const activeChatIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeChatIdRef.current = selectedConv ? selectedConv.chat_id : null;
  }, [selectedConv]);


  // 1. Fetch conversations AND act as your authentication guard
  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const response = await fetch("/api/chat");
        
        // GUARD: If the endpoint returns 401, they are not logged in! Keep it hidden.
        if (response.status === 401) {
          setIsVisible(false);
          return;
        }

        if (response.ok) {
          const data: chat[] = await response.json();
          setConversations(data);
          
          // Rule: If logged in AND they already have chats, show the floating icon
          if (data.length > 0) {
            setIsVisible(true);
            setCurrentUserId(data[0].buyer_id || "");
          }
        }
      } catch (error) {
        console.error("Failed to load chat listings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  // 2. Listen for the product button click event
  useEffect(() => {
    function handleRemoteOpenTrigger(e: Event) {
      const customEvent = e as CustomEvent;
      const chatRow = customEvent.detail;
      
      const formatted: chat = {
        ...chatRow,
        id: chatRow.chat_id.toString(),
        other_user_name: `Seller (${chatRow.seller_id.slice(0, 5)})`,
        product_name: `Product Item #${chatRow.prod_id}`,
        last_message: chatRow.last_message || "No messages yet",
        last_message_at: chatRow.created_at,
        unread_count: 0,
      };

      setConversations((prev) => {
        const exists = prev.some((c) => c.chat_id === formatted.chat_id);
        return exists ? prev : [formatted, ...prev];
      });
      
      setCurrentUserId(chatRow.buyer_id);

      setIsVisible(true); 
      setSelectedConv(formatted);
      setOpen(true);
    }

    window.addEventListener("open_chat_thread", handleRemoteOpenTrigger);
    return () => window.removeEventListener("open_chat_thread", handleRemoteOpenTrigger);
  }, []);

  // Fetch individual thread messages
 useEffect(() => {
    if (!selectedConv) return;
    const chatId = selectedConv.chat_id;

    async function loadMessages() {
      try {
        const response = await fetch(`/api/chat?chatId=${chatId}`);
        if (response.ok) {
          const messagesData = await response.json();
          setMessagesMap((prev) => ({ ...prev, [chatId]: messagesData }));
        }
      } catch (err) {
        console.error("Error pulling history timeline logs:", err);
      }
    }
    
    loadMessages();
  }, [selectedConv?.chat_id]); // Only runs when chat_id itself changes

  // 4. PERMANENT REALTIME CHANNEL: Connects ONCE and stays open seamlessly
useEffect(() => {
  if (!isVisible) return;

  const supabaseClient = createClient();
  let channel: any;

  async function setupRealtime() {
    // A. Grab the true logged-in user session token
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token;

    channel = supabaseClient
      .channel("global-chat-listener")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_message",
        },
        (payload) => {
          console.log("REALTIME PAYLOAD RECEIVED:", payload);
          const newMessage = payload.new as chat_message;
          const targetChatId = Number(newMessage.chat_id);          
          
          setMessagesMap((prev) => {
            const currentRoomMessages = prev[targetChatId] || [];
            const alreadyExists = currentRoomMessages.some(
              (m) => Number(m.message_id) === Number(newMessage.message_id)
            );
            if (alreadyExists) return prev;

            return {
              ...prev,
              [targetChatId]: [...currentRoomMessages, newMessage],
            };
          });

          setConversations((prevConvs) => {
            return prevConvs.map((conv) => {
              if (conv.chat_id === targetChatId) {
                const isCurrentlyViewing = activeChatIdRef.current === targetChatId;
                return {
                  ...conv,
                  last_message: newMessage.message,
                  last_message_at: newMessage.created_at,
                  unread_count: isCurrentlyViewing ? 0 : (conv.unread_count || 0) + 1,
                };
              }
              return conv;
            });
          });
        }
      );

    // B. Inject the token directly into the real-time engine before connecting
    if (token) {
      await supabaseClient.realtime.setAuth(token);
    }

    channel.subscribe((status: string) => {
      console.log("Persistent Realtime Channel Status:", status);
    });
  }

  setupRealtime();

  return () => {
    if (channel) supabaseClient.removeChannel(channel);
  };
}, [isVisible]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConv) return;
    const chatId = selectedConv.chat_id;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: content }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessagesMap((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), savedMessage],
        }));
      }
    } catch (error) {
      console.error("Error dispatching message row insertion:", error);
    }
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // If the user isn't logged in OR hasn't clicked "Chat with Seller", keep everything hidden!
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
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
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#185fa5] to-[#1d9e75]">
            <div className="flex items-center gap-2 min-w-0">
              {selectedConv && (
                <button
                  onClick={() => setSelectedConv(null)}
                  className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <MessageCircle size={18} className="text-white flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white leading-tight truncate">
                  {selectedConv ? selectedConv.other_user_name : "Messages"}
                </span>
                {selectedConv?.product_name && (
                  <span className="text-[11px] text-white/70 leading-tight truncate max-w-[180px]">
                    {selectedConv.product_name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => { setOpen(false); setSelectedConv(null); }}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden bg-white">
            {selectedConv ? (
              <MessageThread
                conversation={selectedConv}
                messages={messagesMap[selectedConv.chat_id] || []} 
                currentUserId={currentUserId} 
                onSendMessage={handleSendMessage}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConv ? selectedConv.chat_id : null} // FIXED: Dynamic reference identification mapping instead of static 'null' 
                currentUserId={currentUserId}
                onSelect={(conv) => setSelectedConv(conv)}
                loading={loading}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating Green Button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) setSelectedConv(null); }}
        aria-label="Open chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-gradient-to-br from-[#185fa5] to-[#1d9e75]"
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