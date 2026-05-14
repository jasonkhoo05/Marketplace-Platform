"use client";

import { useState, useEffect } from "react";
import { FiShoppingBag, FiTrendingUp, FiAlertTriangle, FiPackage } from "react-icons/fi";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { Product } from "@/types/product";

// Temporary localized interface for dashboard order presentation
interface OrderSummary {
    id: string;
    customerName: string;
    totalAmount: number;
    status: "Pending" |"Processing"| "Completed" | "Shipped" | "Cancelled"|"Refunded";  
    createdAt: string;
}

export default function SellerDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
    const [totalOrdersCount, setTotalOrdersCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Run parallel data aggregation
        async function loadDashboardData() {
            try {
                setLoading(true);
                await Promise.all([fetchProducts(), fetchDashboardMetrics()]);
            } catch (error) {
                console.error("Error populating dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    async function fetchProducts() {
        try {
            const response = await fetch('/api/seller/products');
            if (!response.ok) throw new Error('Failed to fetch catalog items');
            const data = await response.json();

            const transformedProducts = data.products.map((product: any) => ({
                id: product.prod_id,
                name: product.prod_name,
                price: product.prod_price,
                quantity: product.prod_stock_qty,
                sales: product.prod_sold_qty || 0,
            }));
            setProducts(transformedProducts);
        } catch (error) {
            console.error('Failed to fetch product metrics:', error);
        }
    }

    async function fetchDashboardMetrics() {
        try {
            // Replace with your distinct dashboard analytical endpoint if available
            const response = await fetch('/api/seller/orders'); 
            if (!response.ok) throw new Error('Failed to fetch sales summary');
            const data = await response.json();

            // Expected payload structure: { totalOrders: number, revenue: number, recentOrders: [...] }
            setTotalOrdersCount(data.totalOrders || 0);
            setTotalRevenue(data.revenue || 0);
            
            // Limit explicitly to the top 5 latest orders
            const formattedOrders = (data.recentOrders || []).slice(0, 5).map((order: any) => ({
                id: order.order_id || `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                customerName: order.customer_name || "Guest Buyer",
                totalAmount: order.total_amount || 0,
                status: order.status || "Pending",
                createdAt: order.created_at ? new Date(order.created_at).toLocaleDateString() : "Today",
            }));
            setRecentOrders(formattedOrders);
        } catch (error) {
            console.error('Failed to fetch revenue metric points:', error);
            // Fallback placeholder mock records if the backend endpoint is still pending setup
            setRecentOrders([
                { id: "ORD-9281", customerName: "Alex Mercer", totalAmount: 125.00, status: "Completed", createdAt: "14/05/2026" },
                { id: "ORD-7742", customerName: "Sarah Connor", totalAmount: 45.50, status: "Pending", createdAt: "14/05/2026" },
            ]);
        }
    }

    // Inventory status derivations
    const totalProducts = products.length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    // Low stock flag threshold set to 5 units or below remaining
    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;

    return (
        <main className="min-h-screen bg-slate-50 pl-60">
            <SellerSidebar />

            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Shop Overview</h1>
                    <p className="text-sm text-slate-500">
                        Monitor your shop's performance, operations, and inventory level metrics.
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
                        <p className="mt-4 text-slate-500">Compiling shop metrics...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 p-6">
                    {/* Main High-Level Performance Grid */}
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                                <FiTrendingUp size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Orders</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrdersCount}</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <FiShoppingBag size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Products</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">{totalProducts}</p>
                            </div>
                            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                                <FiPackage size={24} />
                            </div>
                        </div>
                    </section>

                    {/* Operational Risk Indicators (Stock warnings) */}
                    <section className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 flex items-center gap-4">
                            <div className="rounded-xl bg-red-100 p-3 text-red-600">
                                <FiAlertTriangle size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-slate-900">{outOfStockCount} items need attention</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 flex items-center gap-4">
                            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                                <FiAlertTriangle size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Low Stock Alert</p>
                                <p className="text-2xl font-bold text-slate-900">{lowStockCount} items running low</p>
                            </div>
                        </div>
                    </section>

                    {/* Data Focus: Recent Activity Ledger */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                            <p className="text-xs text-slate-500">The latest 5 transactions completed or processing in your shop.</p>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No sales transactions recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                            <th className="px-6 py-3">Order ID</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Total Amount</th>
                                            <th className="px-6 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/70 transition">
                                                <td className="px-6 py-4 font-mono font-medium text-slate-900">{order.id}</td>
                                                <td className="px-6 py-4">{order.customerName}</td>
                                                <td className="px-6 py-4 text-slate-500">{order.createdAt}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">${order.totalAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                                        ${order.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" : ""}
                                                        ${order.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""}
                                                        ${order.status === "Shipped" ? "bg-blue-50 text-blue-700 border border-blue-200" : ""}
                                                        ${order.status === "Cancelled" ? "bg-slate-100 text-slate-600" : ""}
                                                    `}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}