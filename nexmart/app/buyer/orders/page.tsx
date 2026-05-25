"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import OrderCard from "@/components/buyer/orders/OrderCard";
import EmptyOrders from "@/components/buyer/orders/EmptyOrders";
import DeleteOrderModal from "@/components/buyer/orders/DeleteOrderModal";
import type { MockOrder } from "@/types/checkout";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleteGroupKey, setDeleteGroupKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | MockOrder["status"]>(
    "All",
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/buyer/orders", { cache: "no-store" });
      const data = (await response.json()) as {
        orders?: MockOrder[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load orders.");
      }

      setOrders(data.orders ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load orders.";

      setErrorMessage(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [orders]);

  const pendingCount = orders.filter((order) => order.status === "Pending").length;

  function requestDeleteOrder(order: MockOrder) {
    setDeleteOrderId(order.id);
    setDeleteGroupKey(order.groupKey ?? null);
  }

  function cancelDeleteOrder() {
    setDeleteOrderId(null);
    setDeleteGroupKey(null);
  }

  async function confirmDeleteOrder() {
    if (!deleteOrderId) return;

    try {
      const params = new URLSearchParams({ orderId: deleteOrderId });
      if (deleteGroupKey) {
        params.set("groupKey", deleteGroupKey);
      }

      const response = await fetch(`/api/buyer/orders?${params.toString()}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to cancel order.");
      }

      await loadOrders();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel order.";

      setErrorMessage(message);
    } finally {
      setDeleteOrderId(null);
      setDeleteGroupKey(null);
    }
  }

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
              <p className="mt-2 text-sm text-slate-500">
                Track your purchases and order history from the database.
              </p>
            </div>

            <Link
              href="/buyer/products"
              className="w-fit rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Continue Shopping
            </Link>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard label="Total Orders" value={String(orders.length)} />
            <SummaryCard label="Pending Orders" value={String(pendingCount)} />
            <SummaryCard
              label="Total Spent"
              value={`$${totalSpent.toFixed(2)}`}
              highlight
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {[
              "All",
              "Pending",
              "Processing",
              "Shipped",
              "Completed",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status as "All" | MockOrder["status"])
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              No orders found for this status.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDelete={() => requestDeleteOrder(order)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {deleteOrderId && (
        <DeleteOrderModal
          orderId={deleteOrderId}
          onCancel={cancelDeleteOrder}
          onConfirm={confirmDeleteOrder}
        />
      )}
    </>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold ${
          highlight ? "text-teal-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
