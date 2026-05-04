"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Product } from "@/types/product";

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

export default function ProductTable({
    products,
    onEdit,
    onDelete,
}: ProductTableProps) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-4">Product</th>
                            <th className="px-3 py-4">Category</th>
                            <th className="px-3 py-4">Price</th>
                            <th className="px-3 py-4">Stock</th>
                            <th className="px-3 py-4">Sales</th>
                            <th className="px-3 py-4">Buyer Status</th>
                            <th className="px-3 py-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => {
                            const isOutOfStock = product.quantity === 0;

                            return (
                                <tr
                                    key={product.id}
                                    className={`border-b border-slate-100 transition hover:bg-slate-50 ${isOutOfStock ? "bg-red-50/40" : ""
                                        }`}
                                >
                                    <td className="px-3 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.imageUrls[0]}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-xl object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-slate-900">{product.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {product.imageUrls.length} image
                                                    {product.imageUrls.length > 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-3 py-4 text-sm text-slate-700">
                                        {product.category}
                                    </td>

                                    <td className="px-3 py-4 text-sm font-bold text-slate-900">
                                        ${product.price.toFixed(2)}
                                    </td>

                                    <td
                                        className={`px-3 py-4 text-sm font-medium ${isOutOfStock ? "text-red-500" : "text-slate-700"
                                            }`}
                                    >
                                        {product.quantity}
                                    </td>

                                    <td className="px-3 py-4 text-sm text-slate-700">
                                        {product.sales}
                                    </td>

                                    <td className="px-3 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${isOutOfStock
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {isOutOfStock ? "Out of Stock" : "Available"}
                                        </span>
                                    </td>

                                    <td className="px-3 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(product)}
                                                className="text-slate-600 hover:text-teal-700"
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <FiEdit2 size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(product.id)}
                                                className="text-red-400 hover:text-red-600"
                                                aria-label={`Delete ${product.name}`}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="font-semibold text-slate-700">No products yet</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Click Add Product to create your first listing.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}