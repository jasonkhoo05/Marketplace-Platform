"use client";

import BuyerHeader from "@/app/buyer/prod_components/layout/BuyerHeader";
import Link from "next/link";
import { FiTrash2, FiTag, FiArrowRight } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  stockQuantity: number;
};

type CartApiResponse = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  message?: string;
  error?: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchCart() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/cart");
      const data = (await response.json()) as CartApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load cart.");
      }

      setItems(data.items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load cart.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(id: number, quantity: number) {
    setErrorMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });

      const data = (await response.json()) as CartApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update cart.");
      }

      setItems(data.items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update cart.";

      setErrorMessage(message);
    }
  }

  async function removeItem(id: number) {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as CartApiResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove item.");
      }

      setItems(data.items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove item.";

      setErrorMessage(message);
    }
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const isCartEmpty = items.length === 0;

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Shopping Cart
          </h1>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading cart...
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_380px] gap-8">
              <section className="space-y-4">
                {isCartEmpty ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h2 className="text-xl font-bold text-slate-900">
                      Your cart is empty.
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      No products have been added to your cart yet.
                    </p>

                    <Link
                      href="/buyer/products"
                      className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                      Browse products
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-28 w-28 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            {item.name}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            Seller: {item.seller}
                          </p>

                          <p className="mt-2 text-base font-bold text-teal-700">
                            ${item.price.toFixed(2)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.stockQuantity} available
                          </p>

                          <div className="mt-4 flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="text-lg text-slate-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              -
                            </button>

                            <span className="text-sm font-semibold text-slate-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stockQuantity}
                              className="text-lg text-slate-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="ml-3 text-red-400 hover:text-red-600"
                              aria-label={`Remove ${item.name}`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-lg font-bold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </section>

              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Summary
                </h2>

                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Promo Code
                  </p>

                  <div className="flex overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex flex-1 items-center gap-2 px-4">
                      <FiTag className="text-slate-400" />
                      <input
                        value={promoCode}
                        onChange={(event) =>
                          setPromoCode(event.target.value)
                        }
                        placeholder="Enter code"
                        className="w-full bg-transparent py-3 text-sm outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      className="bg-teal-50 px-5 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4 border-b border-slate-100 pb-6 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Items</span>
                    <span className="font-medium text-slate-900">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span className="font-medium text-slate-900">Free</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-teal-700">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isCartEmpty}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Proceed to Checkout
                  <FiArrowRight />
                </button>

                <Link
                  href="/buyer/products"
                  className="mt-5 block text-center text-sm font-medium text-teal-700 hover:underline"
                >
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}