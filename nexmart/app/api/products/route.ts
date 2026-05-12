
/**
 * Buyer's view of product
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productFromRow, type ProductView, type ProductRow } from "@/lib/products";
import { hasEnvVars } from "@/lib/utils";

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

async function fetchCategoryTabs(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("product_category_type")
    .select("prod_cat_name")
    .order("prod_cat_name", { ascending: true });

  if (error || !data?.length) {
    return ["All"];
  }

  const unique = new Set(
    data
      .map((row) => row.prod_cat_name)
      .filter((c): c is string => Boolean(c)),
  );

  return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
}

export async function GET(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    const minPrice = getNumberParam(searchParams, "minPrice");
    const maxPrice = getNumberParam(searchParams, "maxPrice");
    const minRating = getNumberParam(searchParams, "minRating");
    const inStock = getBooleanParam(searchParams, "inStock");
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

    const supabase = await createClient();

    let query = supabase.from("product").select(`
        prod_id,
        prod_name,
        prod_desc,
        prod_price,
        prod_stock_qty,
        prod_rating,
        prod_sold_qty,
        prod_image,
        prod_cat_link!prod_cat_link_prod_fk(
          prod_cat_id,
          product_category_type!prod_cat_link_prod_cat_fk(
            prod_cat_name)),
        user!product_seller_uuid_fkey(username)
      `);

    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (category && category !== "All") {
      const { data: categoryRow } = await supabase
        .from("product_category_type")
        .select("prod_cat_id")
        .eq("prod_cat_name", category)
        .maybeSingle();

      if (!categoryRow) {
        return NextResponse.json({
          products: [],
          total: 0,
          categories: await fetchCategoryTabs(supabase),
        });
      }

      const { data: linkedProductCategories } = await supabase
        .from("prod_cat_link")
        .select("prod_id")
        .eq("prod_cat_id", categoryRow.prod_cat_id);

        const productIdList = (linkedProductCategories ?? []).map((res) => res.prod_id);

        if (productIdList.length === 0) {
          return NextResponse.json({
            products: [],
            total: 0,
            categories: await fetchCategoryTabs(supabase),
          });
        }

      query = query.in("prod_id", productIdList);
    }

    if (search && search.trim() !== "") {
      query = query.ilike("prod_name", `%${search.trim()}%`);
    }

    if (minPrice !== null) {
      query = query.gte("prod_price", minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte("prod_price", maxPrice);
    }

    if (minRating !== null) {
      query = query.gte("prod_rating", minRating);
    }

    if (inStock === true) {
      query = query.gt("prod_stock_qty", 0);
    }

    switch (sort) {
      case "price_asc":
        query = query.order("prod_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("prod_price", { ascending: false });
        break;
      case "rating_desc":
        query = query.order("prod_rating", { ascending: false });
        break;
      case "newest":
        query = query.order("prod_id", { ascending: false });
        break;
      case "popular":
      default:
        query = query.order("prod_sold_qty", { ascending: false });
        break;
    }

    const [{ data: rows, error }, categories] = await Promise.all([
      query,
      fetchCategoryTabs(supabase),
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products: ProductView[] = ((rows ?? []) as unknown as ProductRow[]).map(
      productFromRow,
    );

    return NextResponse.json({
      products,
      total: products.length,
      categories,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
