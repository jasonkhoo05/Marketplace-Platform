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
  // send messages
}

const QUICK_REPLIES = [
  "What is the shipping time?",
  "Is this item still have stock?",
  "What is the return policy?",
  "Can I get a discount?",
  "Is this item original from manufacturer?"
];

export default function AiChat({ prod_name, prod_price, prod_desc }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sellerJoined, setSellerJoined] = useState(false);

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
        setMessages([{ id: Date.now().toString(), role: "seller", content: `Hi {username}! Welcome to our shop! 
            Feel free to ask me anything about ${prod_name ?? "this product"}`, isAi: true }]);
      } finally {
        setLoading(false);
      }
    };
    greet();
  }, [prod_name, prod_price, prod_desc]);
}