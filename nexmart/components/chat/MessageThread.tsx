"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Conversation } from "@/lib/types/chat";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  conversation: Conversation;
  currentUserId: string;
};

const MOCK_MESSAGES: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "m1",
      conversation_id: "conv-1",
      sender_uuid: "seller-1",
      content: "Hi! Thanks for your interest in the headphones.",
      is_read: true,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "m2",
      conversation_id: "conv-1",
      sender_uuid: "mock-me-123",
      content: "Does it come with a warranty?",
      is_read: true,
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "m3",
      conversation_id: "conv-1",
      sender_uuid: "mock-me-123",
      content: "Also, is it compatible with both iOS and Android?",
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    },
    {
      id: "m4",
      conversation_id: "conv-1",
      sender_uuid: "seller-1",
      content: "Yes, it comes with a 1-year warranty!",
      is_read: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "m5",
      conversation_id: "conv-1",
      sender_uuid: "seller-1",
      content: "And yes, fully compatible with iOS and Android via Bluetooth 5.3.",
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2": [
    {
      id: "m6",
      conversation_id: "conv-2",
      sender_uuid: "mock-me-123",
      content: "Hi, how long does shipping usually take?",
      is_read: true,
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: "m7",
      conversation_id: "conv-2",
      sender_uuid: "seller-2",
      content: "We can ship tomorrow if you order before 3pm.",
      is_read: true,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ],
  "conv-3": [
    {
      id: "m8",
      conversation_id: "conv-3",
      sender_uuid: "mock-me-123",
      content: "Hi, is this still available?",
      is_read: false,
      created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    },
  ],
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessageThread({ conversation, currentUserId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>(
    MOCK_MESSAGES[conversation.id] ?? []
  );
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(MOCK_MESSAGES[conversation.id] ?? []);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    const newMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_uuid: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  }

  // Group by date
  const grouped: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else grouped.push({ date, messages: [msg] });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-10 text-center">
            <p className="text-sm text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-300">Say hello!</p>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[11px] text-slate-400 font-medium">{date}</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex flex-col gap-1">
                {dayMsgs.map((msg, idx) => {
                  const isMine = msg.sender_uuid === currentUserId;
                  const isLast =
                    idx === dayMsgs.length - 1 ||
                    dayMsgs[idx + 1].sender_uuid !== msg.sender_uuid;

                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isLast ? "mb-1" : ""}`}>
                        <div
                          className={`px-3 py-2 text-sm leading-relaxed ${
                            isMine
                              ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-[#185fa5] to-[#1d9e75] text-white"
                              : "rounded-2xl rounded-bl-sm bg-slate-100 text-slate-800"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {isLast && (
                          <p className={`mt-0.5 text-[10px] text-slate-400 ${isMine ? "text-right" : "text-left"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-3 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="h-9 flex-1 rounded-full border-slate-200 bg-slate-50 px-4 text-sm focus-visible:ring-teal-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-[#185fa5] to-[#1d9e75] text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Send size={15} />
          </Button>
        </form>
      </div>
    </div>
  );
}
