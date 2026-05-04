"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductForm from "@/components/seller/ProductForm";
import ProductTable from "@/components/seller/ProductTable";
import { mockProducts } from "@/data/mockProducts";
import { Product } from "@/types/product";

export default function SellerDashboardPage() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    function handleSaveProduct(product: Product) {
        setProducts((currentProducts) => {
            const productAlreadyExists = currentProducts.some(
                (currentProduct) => currentProduct.id === product.id
            );

            if (productAlreadyExists) {
                return currentProducts.map((currentProduct) =>
                    currentProduct.id === product.id ? product : currentProduct
                );
            }

            return [product, ...currentProducts];
        });

        closeForm();
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

                <ProductTable
                    products={products}
                    onEdit={openEditForm}
                    onDelete={handleDeleteProduct}
                />
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