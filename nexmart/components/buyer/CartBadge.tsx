"use client";

import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadCartCount() {
      try {
        const response = await fetch("/api/cart", {
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { totalItems?: number };
        setTotalItems(data.totalItems ?? 0);
      } catch {
        // Ignore: badge is optional when cart cannot be loaded.
      }
    }

    loadCartCount();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <Link
      href="/buyer/cart"
      className="relative text-slate-700 hover:text-teal-700"
    >
      <FiShoppingCart size={21} />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
