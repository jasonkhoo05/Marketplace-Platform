"use client";

import type { ProductView } from "@/lib/products";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  product: ProductView;
};

type CartApiResponse = {
  message?: string;
  error?: string;
};

export default function ProductPurchasePanel({ product }: Props) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isInitializingChat, setIsInitializingChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const isSeller = currentUserId === product.seller_uuid;

  const outOfStock = product.stockQuantity === 0;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(product.stockQuantity, current + 1)
    );
  }
  async function handleChatWithSeller() {
    setIsInitializingChat(true);
    setMessage("");
    console.log("--- DEBUG START ---");
    console.log("Raw Product Object Received by Frontend:", product);
    console.log("Value of seller_id:", product?.seller_uuid);
    console.log("Value of seller:", product?.seller);
    console.log("--- DEBUG END ---");

    //  THE CRITICAL FIX: Use the new UUID property we exposed in the product mapper
    const cleanSellerId = product.seller_uuid;

    // Safety fallback flag warning
    if (!cleanSellerId || cleanSellerId === "i_tired") {
      setIsInitializingChat(false);
      setMessage("Error: Component is still receiving username instead of UUID. Please refresh your data cache.");
      return;
    }

    try {
      // 1. Point this to the endpoint that actually logs/creates the chat channel rows
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: cleanSellerId, // This is now a clean UUID string!
          productId: product.id,
          message: "Hi, I'm interested in this item!" 
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const chatData = await response.json();

      if (!response.ok) {
        throw new Error(chatData.error ?? "Could not initialize thread.");
      }

      // 2. SAFETY GUARD: If backend structure didn't return a chat_id property, reconstruct it from fallbacks
      const structuredPayload = {
        ...chatData,
        chat_id: chatData.chat_id ?? chatData.id,
        buyer_id: chatData.buyer_id,
        seller_id: cleanSellerId,
        prod_id: product.id,
        prod_name: product.name,
        prod_price: product.price,
        prod_desc: product.description,
        prod_stock: product.stockQuantity,
      };

      if (!structuredPayload.chat_id) {
        throw new Error("Initialization failed: Missing chat identification parameters.");
      }

      // 3. Dispatch the custom synthetic window event safely
      window.dispatchEvent(
        new CustomEvent("open_chat_thread", { detail: structuredPayload })
      );

    } catch (err: any) {
      setMessage(err.message || "Failed to setup conversation channel.");
    } finally {
      setIsInitializingChat(false);
    }
  }

  async function addToCart() {
    if (outOfStock) {
      setMessage("This product is out of stock.");
      return false;
    }

    setIsAdding(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            seller: product.seller,
            stockQuantity: product.stockQuantity,
          },
          quantity,
        }),
      });

      const data = (await response.json()) as CartApiResponse;

      if (response.status === 401) {
        router.push("/login");
        return false;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add product to cart.");
      }

      setMessage(data.message ?? "Product added to cart.");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add product to cart.";

      setMessage(errorMessage);
      return false;
    } finally {
      setIsAdding(false);
    }
  }

  async function buyNow() {
    const addedSuccessfully = await addToCart();

    if (addedSuccessfully) {
      router.push("/buyer/cart");
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-6">
        <p className="w-24 text-sm text-slate-500">Quantity</p>

        <div className="flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={outOfStock || quantity === 1 || isAdding}
            className="px-4 py-2 text-slate-600 disabled:text-slate-300"
          >
            -
          </button>

          <span className="min-w-12 border-x border-slate-200 px-4 py-2 text-center text-sm">
            {outOfStock ? 0 : quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              outOfStock ||
              quantity === product.stockQuantity ||
              isAdding
            }
            className="px-4 py-2 text-slate-600 disabled:text-slate-300"
          >
            +
          </button>
        </div>

        <p className="text-sm text-slate-500">
          {outOfStock
            ? "Out of stock"
            : `${product.stockQuantity} available`}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addToCart}
          disabled={outOfStock || isAdding}
          className="flex-1 rounded-xl border border-teal-700 bg-teal-50 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={outOfStock || isAdding}
          className="flex-1 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Buy Now
        </button>
      </div>

      {!isSeller && (
        <button
          type="button"
          onClick={handleChatWithSeller}
          disabled={isInitializingChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <MessageCircle size={17} />
          {isInitializingChat ? "Opening Chat..." : "Chat with Seller"}
        </button>
      )}

      {message && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>{message}</p>

          {message.toLowerCase().includes("added") && (
            <Link
              href="/buyer/cart"
              className="mt-1 inline-block font-semibold text-teal-700 hover:underline"
            >
              View cart
            </Link>
          )}
        </div>
      )}
    </div>
  );
}