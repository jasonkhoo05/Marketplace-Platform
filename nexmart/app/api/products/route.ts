// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { products, type Product } from "@/lib/products";

type SortOption =
  | "popular"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "newest";

function getNumberParam(
  searchParams: URLSearchParams,
  key: string,
): number | null {
  const value = searchParams.get(key);

  if (value === null || value.trim() === "") {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    throw new Error(`${key} must be a valid number`);
  }

  return numberValue;
}

function getBooleanParam(
  searchParams: URLSearchParams,
  key: string,
): boolean | null {
  const value = searchParams.get(key);

  if (value === null || value.trim() === "") {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${key} must be true or false`);
}

function getSortParam(searchParams: URLSearchParams): SortOption {
  const sort = searchParams.get("sort") ?? "popular";

  const validSortOptions: SortOption[] = [
    "popular",
    "price_asc",
    "price_desc",
    "rating_desc",
    "newest",
  ];

  if (!validSortOptions.includes(sort as SortOption)) {
    throw new Error(
      "sort must be one of: popular, price_asc, price_desc, rating_desc, newest",
    );
  }

  return sort as SortOption;
}

function filterProducts(
  productList: Product[],
  searchParams: URLSearchParams,
): Product[] {
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const minPrice = getNumberParam(searchParams, "minPrice");
  const maxPrice = getNumberParam(searchParams, "maxPrice");
  const minRating = getNumberParam(searchParams, "minRating");
  const inStock = getBooleanParam(searchParams, "inStock");

  let filteredProducts = [...productList];

  if (category && category !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (search) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (minPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice,
    );
  }

  if (maxPrice !== null) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= maxPrice,
    );
  }

  if (minRating !== null) {
    filteredProducts = filteredProducts.filter(
      (product) => product.rating >= minRating,
    );
  }

  if (inStock === true) {
    filteredProducts = filteredProducts.filter(
      (product) => product.stockQuantity > 0,
    );
  }

  return filteredProducts;
}

function sortProducts(productList: Product[], sort: SortOption): Product[] {
  const sortedProducts = [...productList];

  switch (sort) {
    case "price_asc":
      return sortedProducts.sort((a, b) => a.price - b.price);

    case "price_desc":
      return sortedProducts.sort((a, b) => b.price - a.price);

    case "rating_desc":
      return sortedProducts.sort((a, b) => b.rating - a.rating);

    case "newest":
      return sortedProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    case "popular":
    default:
      return sortedProducts.sort((a, b) => b.quantitySold - a.quantitySold);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const minPrice = getNumberParam(searchParams, "minPrice");
    const maxPrice = getNumberParam(searchParams, "maxPrice");
    const minRating = getNumberParam(searchParams, "minRating");
    const sort = getSortParam(searchParams);

    if (minPrice !== null && minPrice < 0) {
      return NextResponse.json(
        { error: "minPrice cannot be negative" },
        { status: 400 },
      );
    }

    if (maxPrice !== null && maxPrice < 0) {
      return NextResponse.json(
        { error: "maxPrice cannot be negative" },
        { status: 400 },
      );
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return NextResponse.json(
        { error: "minPrice cannot be greater than maxPrice" },
        { status: 400 },
      );
    }

    if (minRating !== null && (minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        { error: "minRating must be between 0 and 5" },
        { status: 400 },
      );
    }

    const filteredProducts = filterProducts(products, searchParams);
    const sortedProducts = sortProducts(filteredProducts, sort);

    return NextResponse.json({
      products: sortedProducts,
      total: sortedProducts.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}