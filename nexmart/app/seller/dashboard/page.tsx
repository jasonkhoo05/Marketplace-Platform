"use client";

import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductForm from "@/components/seller/ProductForm";
import ProductTable from "@/components/seller/ProductTable";
import { Product } from "@/types/product";

export default function SellerDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                
                
                const transformedProducts = data.products.map((product: any) => ({
                    id: product.prod_id.toString(),
                    name: product.prod_name,
                    description: product.prod_desc,
                    price: product.prod_price,
                    quantity: product.prod_stock_qty,
                    category: product.product_category_type,
                    categoryId: product.prod_cat_id,
                    imageUrls: [product.prod_image],
                    sales: product.prod_sold_qty || 0,
                    createdAt: product.created_at,
                }));
                
                setProducts(transformedProducts);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    function openCreateForm() {
        setEditingProduct(null);
        setIsFormOpen(true);
    }

    function openEditForm(product: Product) {
        setEditingProduct(product);
        setIsFormOpen(true);
    }

    function closeForm() {
        setEditingProduct(null);
        setIsFormOpen(false);
    }

    async function handleSaveProduct(product: Product) {
        try {
            const res = await fetch("/api/product", {
                method: "POST",
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
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create product');
            }

            const data = await res.json();
            
            // Refresh products list after creation
            const refreshResponse = await fetch('/api/products');
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const transformedProducts = refreshData.products.map((product: any) => ({
                    id: product.prod_id.toString(),
                    name: product.prod_name,
                    description: product.prod_desc,
                    price: product.prod_price,
                    quantity: product.prod_stock_qty,
                    category: product.product_category_type,
                    categoryId: product.prod_cat_id,
                    imageUrls: [product.prod_image],
                    sales: product.prod_sold_qty || 0,
                    createdAt: product.created_at,
                }));
                setProducts(transformedProducts);
            }

            closeForm();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        }
    }

    function handleDeleteProduct(productId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product listing?"
        );

        if (!confirmed) return;

        setProducts((currentProducts) =>
            currentProducts.filter((product) => product.id !== productId)
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pl-60">
            <SellerSidebar />

            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Seller Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Manage your product listings for the marketplace.
                    </p>
                </div>

                {/* <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                >
                    <FiPlus size={17} />
                    Add Product
                </button> */}
            </header>

            <div className="space-y-6 p-6">
                <section className="grid gap-5 md:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Products</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {products.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Available Products</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {products.filter((product) => product.quantity > 0).length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Out of Stock</p>
                        <p className="mt-2 text-2xl font-bold text-red-500">
                            {products.filter((product) => product.quantity === 0).length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Sales</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {products.reduce((total, product) => total + product.sales, 0)}
                        </p>
                    </div>
                </section>

                <section className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">My Products</h2>
                        <p className="text-sm text-slate-500">
                            Create, edit and manage product listings.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                    >
                        <FiPlus size={17} />
                        Add Product
                    </button>
                </section>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
                            <p className="mt-4 text-slate-500">Loading products...</p>
                        </div>
                    </div>
                ) : (
                    <ProductTable
                        products={products}
                        onEdit={openEditForm}
                        onDelete={handleDeleteProduct}
                    />
                )}
            </div>

            {isFormOpen && (
                <ProductForm
                    onClose={closeForm}
                    onSubmit={handleSaveProduct}
                    editingProduct={editingProduct}
                />
            )}
        </main>
    );
}