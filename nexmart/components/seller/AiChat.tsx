"use client"

import { useEffect, useState } from "react";

interface Message {
  id: string;
  role: "seller" | "buyer";
  content: string;
  isAi?: boolean;
}

interface AiChatProps {
  prod_name?: string;
  prod_price?: string;
  prod_desc?: string;
  username?: string;
  // send messages
}

const QUICK_REPLIES = [
  "What is the shipping time?",
  "Is this item still have stock?",
  "What is the return policy?",
  "Can I get a discount?",
  "Is this item original from manufacturer?"
];

export default function AiChat({ prod_name, prod_price, prod_desc, username }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sellerInterrupt, setSellerInterrupt] = useState(false);

  useEffect(() => {
    const greet = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isGreet: true, prod_name, prod_price, prod_desc }),
        });
        const data = await res.json();
        setMessages([{ id: Date.now().toString(), role: "seller", content: data.reply, isAi: true }]);
      } catch {
        setMessages([{ id: Date.now().toString(), role: "seller", content: `Hi ${username?? "there"}! Welcome to our shop! 
            Feel free to ask me anything about ${prod_name ?? "this product"}`, isAi: true }]);
      } finally {
        setLoading(false);
      }
    };
    greet();
  }, [prod_name, prod_price, prod_desc]);

  const sendToAI = async (message: string) => {
    if (!message.trim() || loading) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "buyer", content: message }]);
    setInput("");
    if (sellerInterrupt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, prod_name, prod_price, prod_desc }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "seller", content: data.reply, isAi: true }]);
      // TODO: if (sendMessage) sendMessage(data.reply);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "seller", content: "Sorry, something went wrong. Please wait for the seller 🙏", isAi: true }]);
    } finally {
      setLoading(false);
    }
  };

  const sellerSendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "seller", content: input, isAi: false }]);
    setInput("");
    setSellerInterrupt(true);
    // setSendMessage
  };

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-orange-500 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">S</div>
            <div>
            <p className="text-white font-semibold text-sm">Seller</p>
            <p className="text-orange-100 text-xs">{sellerInterrupt ? "Seller is active" : "AI is handling your chat"}</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 min-h-[300px]">
            {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === "buyer" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "buyer" ? "bg-orange-500 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"}`}>
                {msg.content}
                </div>
                {msg.isAi && <p className="text-[10px] text-gray-400 mt-1 ml-1">🤖 This is an AI reply, it might not be accurate</p>}
            </div>
            ))}
            {loading && (
            <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-gray-400 text-sm italic">Typing...</div>
            </div>
            )}
        </div>

        {!sellerInterrupt && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
            {QUICK_REPLIES.map((q) => (
                <button key={q} onClick={() => sendToAI(q)} disabled={loading} className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-orange-300 text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50">
                {q}
                </button>
            ))}
            </div>
        )}

        <div className="px-3 py-3 flex gap-2 bg-white border-t border-gray-100">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sellerInterrupt ? sellerSendMessage() : sendToAI(input); }}
            placeholder={sellerInterrupt ? "Seller is typing..." : "Type a message..."}
            disabled={loading}
            className="flex-1 text-sm px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-orange-400 disabled:opacity-50"
            />
            <button onClick={() => sellerInterrupt ? sellerSendMessage() : sendToAI(input)} disabled={loading || !input.trim()} className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
            Send
            </button>
        </div>
    </div>
    );
}