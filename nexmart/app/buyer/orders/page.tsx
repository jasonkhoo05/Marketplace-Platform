"use client";

import { useEffect, useState } from "react";
import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import OrderCard from "@/components/buyer/orders/OrderCard";
import EmptyOrders from "@/components/buyer/orders/EmptyOrders";
import type { MockOrder } from "@/types/checkout";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedOrders = sessionStorage.getItem("mockOrders");

    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders) as MockOrder[]);
      } catch {
        setOrders([]);
      }
    }

    setIsLoading(false);
  }, []);

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
            <p className="mt-2 text-sm text-slate-500">
              View your recent orders and order details.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}