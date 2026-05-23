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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        const response = await fetch('/api/seller/orders'); 
        if (!response.ok) throw new Error('Failed to fetch sales summary');
        const data = await response.json();

        // 1. Get the actual orders array returned by your API
        const orderList = data.orders || [];

        // 2. Dynamically count total orders on the client
        setTotalOrdersCount(orderList.length);

        // 3. Calculate total revenue from the order list
        const computedRevenue = orderList.reduce((acc: number, order: any) => {
            // Optional: Skip cancelled or refunded metrics if desired
            if (order.status === "Cancelled" || order.status === "Refunded") return acc;
            return acc + (Number(order.total_price) || 0);
        }, 0);
        setTotalRevenue(computedRevenue);
        
        // 4. Map properties using the exact key names coming from your database query
        const formattedOrders = orderList.slice(0, 5).map((order: any) => ({
            id: order.order_id ? `#${order.order_id}` : `ORD-UNK`,
            customerName: order.buyer_name || "Guest Buyer",
            totalAmount: Number(order.total_price) || 0,
            status: order.status || "Pending",
            createdAt: order.order_date 
                ? new Date(order.order_date).toLocaleDateString() 
                : "Today",
        }));

        setRecentOrders(formattedOrders);

    } catch (error) {
        console.error('Failed to fetch revenue metric points:', error);
        // Fallback placeholder mock records only if the API request itself fails completely
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

    function openCreateForm() {
        setEditingProduct(null);
        setIsFormOpen(true);
    }

    function openEditForm(product: Product) {
        if (product.status === "hidden") {
        alert("Invalid action: rejected listings cannot be edited.");
        return;
        }
        
        setEditingProduct(product);
        setIsFormOpen(true);
    }

    function closeForm() {
        setEditingProduct(null);
        setIsFormOpen(false);
    }

    async function handleSaveProduct(product: Product) {
        try {

            if (editingProduct?.status === "hidden"){
                alert("Invalid action: rejected listings cannot be edited.");
                return;
            }
            const isEditing = editingProduct;
            const res = await fetch(
                isEditing? `/api/product/${editingProduct.id}`: "/api/product", {
                method: isEditing? "PUT": "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prod_name: product.name,
                    prod_desc: product.description,
                    prod_price: product.price,
                    prod_stock_qty: product.quantity,
                    prod_cat_id: product.categoryId,
                    prod_image: product.imageUrls[0] || "/products/placeholder.jpg"
                })
            });


            if (!res.ok) {
                let errorMessage = "Failed to save product. Please try again.";

                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // Keep default error message if response is not JSON
                    alert("Failed to save product. Please try again.");
                }

                alert(errorMessage);
                return;
            }

            // const data = await res.json();


            // Refresh products list after creation
            // const refreshResponse = await fetch('/api/seller/products');
            // if (refreshResponse.ok) {
            //     const refreshData = await refreshResponse.json();
            //     const transformedProducts = refreshData.products.map((product: any) => ({
            //         id: product.prod_id.toString(),
            //         name: product.prod_name,
            //         description: product.prod_desc,
            //         price: product.prod_price,
            //         quantity: product.prod_stock_qty,
            //         category: product.product_category_type,
            //         // categoryId: product.prod_cat_id,
            //         imageUrls: [product.prod_image],
            //         sales: product.prod_sold_qty || 0,
            //         createdAt: product.created_at,
            //     }));
            //     setProducts(transformedProducts);
            // }

            // add to prod_cat_id
            // if (!isEditing) {
            //     const newProdId = data.product.prod_id;

            //     console.log(data);
            //     await fetch("/api/product/category", {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //         body: JSON.stringify({
            //             prod_id: newProdId,
            //             prod_cat_id: product.categoryId,
            //         })
            //     });

            // }

            await fetchProducts();

            closeForm();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        }
    }

    async function handleDeleteProduct(productId: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product listing?"
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/seller/products/${productId}`,
                { method: "DELETE"});

            if (!res.ok) {
                const body = await res.json();
                console.log("server error", body)
                throw new Error("Failed to delete product");

            }
            setProducts(curr => curr.filter(prod => prod.id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product. Please try again.")
        }


        // setProducts((currentProducts) =>
        //     currentProducts.filter((product) => product.id !== productId)
        // );
    }

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