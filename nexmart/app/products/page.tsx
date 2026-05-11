// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/app/prod_components/layout/Header";
import Navbar from "@/app/prod_components/layout/Navbar";
import ProductFilters from "@/app/prod_components/products/ProductFilters";
import ProductGrid from "@/app/prod_components/products/ProductGrid";
import ProductToolbar, {
  type SortOption,
} from "@/app/prod_components/products/ProductToolbar";
import { type ProductView } from "@/lib/products";

type ProductsApiResponse = {
  products: ProductView[];
  total: number;
  categories?: string[];
  error?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<string[]>(["All"]);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("popular");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchProducts() {
      setIsLoading(true);
      setErrorMessage("");

      const params = new URLSearchParams();

      if (category !== "All") {
        params.set("category", category);
      }

      if (search.trim() !== "") {
        params.set("search", search.trim());
      }

      if (minPrice !== "") {
        params.set("minPrice", minPrice);
      }

      if (maxPrice !== "") {
        params.set("maxPrice", maxPrice);
      }

      if (minRating !== "") {
        params.set("minRating", minRating);
      }

      if (inStockOnly) {
        params.set("inStock", "true");
      }

      params.set("sort", sort);

      const queryString = params.toString();
      const apiUrl = queryString
        ? `/api/products?${queryString}`
        : "/api/products";

      try {
        const response = await fetch(apiUrl, {
          signal: abortController.signal,
        });

        const data = (await response.json()) as ProductsApiResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to fetch products");
        }

        setProducts(data.products);
        setTotalProducts(data.total);
        if (data.categories?.length) {
          setCategories(data.categories);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch products";

        setErrorMessage(message);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      abortController.abort();
    };
  }, [category, search, minPrice, maxPrice, minRating, inStockOnly, sort]);

  function clearFilters() {
    setCategory("All");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStockOnly(false);
    setSort("popular");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header search={search} onSearchChange={setSearch} />
      <Navbar categories={categories} onSelect={setCategory} />

      <section className="grid grid-cols-[260px_1fr] gap-8 px-16 py-8">
        <ProductFilters
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          inStockOnly={inStockOnly}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onMinRatingChange={setMinRating}
          onInStockOnlyChange={setInStockOnly}
          onClearFilters={clearFilters}
        />

        <div>
          <ProductToolbar
            count={totalProducts}
            sort={sort}
            onSortChange={setSort}
          />

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
              Loading products...
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </section>
    </main>
  );
}