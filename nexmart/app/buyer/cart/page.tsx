"use client";

import BuyerHeader from "@/app/buyer/prod_components/layout/BuyerHeader";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2, FiTag, FiArrowRight } from "react-icons/fi";
import { useMemo, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const initialItems: CartItem[] = [
  {
    id: 1,
    name: "Wizard Notebook",
    price: 18.9,
    image: "/products/WizardNotebook.jpg",
    quantity: 1,
  },
  {
    id: 2,
    name: "Harry Potter Book 1",
    price: 45.9,
    image: "/products/HarryPotterBook1.jpg",
    quantity: 1,
  },
  {
    id: 3,
    name: "Kitchen Mug",
    price: 22,
    image: "/products/KitchenMug.jpg",
    quantity: 2,
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [promoCode, setPromoCode] = useState("");

  function increaseQuantity(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  }

  function removeItem(id: number) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-[1fr_380px] gap-8">
            <section className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {item.name}
                      </h2>

                      <p className="mt-2 text-base font-bold text-teal-700">
                        ${item.price}
                      </p>

                      <div className="mt-4 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          className="text-lg text-slate-600 hover:text-teal-700"
                        >
                          -
                        </button>

                        <span className="text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          className="text-lg text-slate-600 hover:text-teal-700"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="ml-3 text-red-400 hover:text-red-600"
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
              ))}
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
                      onChange={(event) => setPromoCode(event.target.value)}
                      placeholder="Enter code"
                      className="w-full bg-transparent py-3 text-sm outline-none"
                    />
                  </div>

                  <button className="bg-teal-50 px-5 text-sm font-semibold text-teal-700 hover:bg-teal-100">
                    Apply
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-b border-slate-100 pb-6 text-sm">
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
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-lg font-bold text-teal-700">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800">
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
        </div>
      </main>
    </>
  );
}
