"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { products, categories } from "@/lib/products";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchText]);

  return (
    <main className="min-h-screen bg-background px-8 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product List</h1>
          <p className="mt-2 text-muted-foreground">
            Browse products by category or search by name.
          </p>
        </div>

        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border bg-white px-4 py-2 md:w-72"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="relative mb-4 h-72 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-muted-foreground">
                {product.category}
              </p>
              <p className="mt-2 font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}