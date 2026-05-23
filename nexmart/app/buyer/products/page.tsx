// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProductPagination from "@/components/buyer/products/ProductPagination";
import BuyerSidebar from "@/components/buyer/layout/BuyerSidebar";
import ProductGrid from "@/components/buyer/products/ProductGrid";
import ProductToolbar, {
  type SortOption,
} from "@/components/buyer/products/ProductToolbar";
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
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;
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

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-slate-50 pl-60">
      <BuyerSidebar
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
    
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Buyer Marketplace
            </h1>
            <p className="text-sm text-slate-500">
              Browse and purchase products from the marketplace.
            </p>
          </div>
  
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for products..."
            className="w-[360px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-teal-700"
          />
        </div>
  
        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

      </header>
      <div className="space-y-6 p-6">
        <ProductToolbar
          count={totalProducts}
          sort={sort}
          onSortChange={setSort}
        />
  
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}
  
        {isLoading ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
            Loading products...
          </div>
        ) : (
          <>
          <ProductGrid products={products} />
          <ProductPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          </>
        )}
      </div>
    </main>
  );
}