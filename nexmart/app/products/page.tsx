// app/products/page.tsx
"use client";

import { useState } from "react";
import Header from "@/app/prod_components/layout/Header";
import Navbar from "@/app/prod_components/layout/Navbar";
import ProductFilters from "@/app/prod_components/products/ProductFilters";
import ProductGrid from "@/app/prod_components/products/ProductGrid";
import ProductToolbar from "@/app/prod_components/products/ProductToolbar";
import { products } from "@/lib/products";

export default function ProductsPage() {
  const [category, setCategory] = useState("Fashion");

  return (
    <main>
      <Header />
      <Navbar categories={["Home", "Fashion"]} onSelect={setCategory} />

      <section className="grid grid-cols-[260px_1fr] gap-8 px-16 py-8">
        <ProductFilters />

        <div>
          <ProductToolbar count={products.length} />
          <ProductGrid products={products} />
        </div>
      </section>
    </main>
  );
}