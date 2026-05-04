"use client";

import { FormEvent, useState } from "react";
import { FiX } from "react-icons/fi";
import ProductImageUploader from "./ProductImageUploader";
import { Product, ProductCategory, ProductFormData } from "@/types/product";

interface ProductFormProps {
    onClose: () => void;
    onSubmit: (product: Product) => void;
    editingProduct?: Product | null;
}

type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>;

const categories: ProductCategory[] = [
    "Electronics",
    "Fashion",
    "Home",
    "Beauty",
    "Sports",
    "Books",
    "Others",
];

export default function ProductForm({
    onClose,
    onSubmit,
    editingProduct,
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: editingProduct?.name ?? "",
        price: editingProduct ? String(editingProduct.price) : "",
        quantity: editingProduct ? String(editingProduct.quantity) : "",
        category: editingProduct?.category ?? "",
        imageUrls: editingProduct?.imageUrls ?? [],
    });

    const [errors, setErrors] = useState<ProductFormErrors>({});

    function updateField<K extends keyof ProductFormData>(
        field: K,
        value: ProductFormData[K]
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: undefined,
        }));
    }

    function validateForm(): boolean {
        const newErrors: ProductFormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Product name is required.";
        }

        if (!formData.price.trim()) {
            newErrors.price = "Price is required.";
        } else if (Number(formData.price) <= 0 || Number.isNaN(Number(formData.price))) {
            newErrors.price = "Price must be greater than 0.";
        }

        if (!formData.quantity.trim()) {
            newErrors.quantity = "Quantity is required.";
        } else if (Number(formData.quantity) < 0 || Number.isNaN(Number(formData.quantity))) {
            newErrors.quantity = "Quantity cannot be negative.";
        }

        if (!formData.category) {
            newErrors.category = "Category is required.";
        }

        if (formData.imageUrls.length === 0) {
            newErrors.imageUrls = "At least one product image is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) return;

        const product: Product = {
            id: editingProduct?.id ?? crypto.randomUUID(),
            name: formData.name.trim(),
            price: Number(formData.price),
            quantity: Number(formData.quantity),
            category: formData.category as ProductCategory,
            imageUrls: formData.imageUrls,
            sales: editingProduct?.sales ?? 0,
            createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
        };

        onSubmit(product);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {editingProduct ? "Edit Product" : "Create Product Listing"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Add product details so buyers can view it in the marketplace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close form"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="productName" className="mb-2 block text-sm font-semibold text-slate-700">
                            Product Name
                        </label>
                        <input
                            id="productName"
                            type="text"
                            value={formData.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            placeholder="Example: Wireless Earbuds Pro"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        />
                        {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label htmlFor="price" className="mb-2 block text-sm font-semibold text-slate-700">
                                Price
                            </label>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(event) => updateField("price", event.target.value)}
                                placeholder="129.99"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                            />
                            {errors.price && <p className="mt-2 text-sm text-red-500">{errors.price}</p>}
                        </div>

                        <div>
                            <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-slate-700">
                                Quantity Available
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(event) => updateField("quantity", event.target.value)}
                                placeholder="45"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                            />
                            {errors.quantity && (
                                <p className="mt-2 text-sm text-red-500">{errors.quantity}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="mb-2 block text-sm font-semibold text-slate-700">
                            Category
                        </label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(event) =>
                                updateField("category", event.target.value as ProductCategory | "")
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                        >
                            <option value="">Select product category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-2 text-sm text-red-500">{errors.category}</p>
                        )}
                    </div>

                    <ProductImageUploader
                        imageUrls={formData.imageUrls}
                        onChange={(imageUrls) => updateField("imageUrls", imageUrls)}
                        error={errors.imageUrls}
                    />

                    {Number(formData.quantity) === 0 && formData.quantity !== "" && (
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            This product will be shown as <strong>Out of Stock</strong> to buyers.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                        >
                            {editingProduct ? "Save Changes" : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}