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
