"use client";

import { useState, useEffect } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { Order, OrderStatus } from "@/types/order";
import { FiEye, FiChevronDown,FiCheck,FiMapPin } from "react-icons/fi";
/*
const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-1005",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
        productName: "Wireless Headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80",
        quantity: 1,
        totalPrice: 59.99,
        orderDate: "12 May 2026, 02:30 PM",
        status: "Pending" as OrderStatus,
    },
    {
        id: "ORD-1004",
        buyerName: "Sarah Wilson",
        buyerEmail: "sarah@example.com",
        productName: "Travel Backpack",
        productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&q=80",
        quantity: 2,
        totalPrice: 79.98,
        orderDate: "11 May 2026, 11:20 AM",
        status: "Processing" as OrderStatus,
    },
    {
        id: "ORD-1003",
        buyerName: "Michael Brown",
        buyerEmail: "michael@example.com",
        productName: "Stainless Steel Bottle",
        productImage: "https://images.unsplash.com/photo-1602143307185-8c1c5595218e?w=100&q=80",
        quantity: 1,
        totalPrice: 15.99,
        orderDate: "10 May 2026, 09:15 AM",
        status: "Shipped" as OrderStatus,
    },
    {
        id: "ORD-1002",
        buyerName: "Emily Davis",
        buyerEmail: "emily@example.com",
        productName: "Running Shoes",
        productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80",
        quantity: 1,
        totalPrice: 69.99,
        orderDate: "09 May 2026, 04:45 PM",
        status: "Completed" as OrderStatus,
    },
    {
        id: "ORD-1001",
        buyerName: "David Lee",
        buyerEmail: "david@example.com",
        productName: "Smart Watch",
        productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80",
        quantity: 1,
        totalPrice: 89.99,
        orderDate: "08 May 2026, 01:10 PM",
        status: "Cancelled" as OrderStatus,
    },
];
*/
const ALL_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Completed", "Cancelled", "Refunded"];

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
}, []);

async function fetchOrders() {
    try {
        const response = await fetch("/api/seller/orders");

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        const transformed = data.orders.map((o: any) => ({
            id: o.order_id.toString(),
            buyerName: o.buyer_name,
            buyerEmail: o.buyer_email,
            productName: o.product_name,
            productImage: o.product_image || "/placeholder.jpg",
            buyerAddress: o.buyer_address,
            quantity: o.quantity,
            totalPrice: o.total_price || 0,
            orderDate: new Date(o.order_date).toLocaleString(),
            status: o.status as OrderStatus,
        }));

        setOrders(transformed);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
    } finally {
        setLoading(false);
    }
}


    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-orange-100 text-orange-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'Refunded': return 'bg-yellow-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };
    
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
        const response = await fetch(`/api/seller/orders/${orderId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error("Failed to update order status");
        }

        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        setOpenDropdownId(null);
    } catch (error) {
        console.error("Failed to update order:", error);
        alert("Failed to update order status.");
    }
};

    return (
        <main className="min-h-screen bg-slate-50 pl-60">
            <SellerSidebar />
            <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-6">
                <h1 className="text-xl font-bold text-slate-900">Orders</h1>
            </header>

            <div className="p-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Buyer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4 text-center">Quantity</th>
                                <th className="px-6 py-4">Total Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{order.buyerName}</span>
                                            <span className="text-xs text-slate-500">{order.buyerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex items-start gap-1 text-slate-600">
                                                <FiMapPin className="text-slate-400 mt-0.5 flex-shrink-0" size={14} />
                                                <span className="text-xs break-words line-clamp-2" title={order.buyerAddress}>
                                                    {order.buyerAddress}
                                                </span>
                                            </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={order.productImage} alt="" className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                                            <span className="max-w-[150px] truncate">{order.productName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">{order.quantity}</td>
                                    <td className="px-6 py-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                                    
                                    {/* STATUS COLUMN - Fixed nesting */}
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:ring-2 hover:ring-slate-200 ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                            <FiChevronDown className={`transition-transform ${openDropdownId === order.id ? "rotate-180" : ""}`} />
                                        </button>

                                        {openDropdownId === order.id && (
                                            <>
                                                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                                                <div className="absolute left-0 mt-2 z-40 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                                    <div className="p-1">
                                                        {ALL_STATUSES.map((statusOption) => (
                                                            <button
                                                                key={statusOption}
                                                                onClick={() => handleStatusChange(order.id, statusOption)}
                                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-slate-50 ${
                                                                    order.status === statusOption ? "text-teal-700 bg-teal-50/50" : "text-slate-600"
                                                                }`}
                                                            >
                                                                {statusOption}
                                                                {order.status === statusOption && <FiCheck />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 ml-auto">
                                            <FiEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}


