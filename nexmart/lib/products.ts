// for customer to view
export type ProductView = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string[];
  image: string;
  rating: number;
  seller: string;
  seller_uuid: string;
  quantitySold: number;
  stockQuantity: number;
};

type ProductCategoryRow = {
  prod_cat_name: string | null;
};

type ProductCatLinkRow = {
  prod_cat_id?: number;
  /** PostgREST may return one row or an array for the same relationship embed */
  product_category_type?:
    | ProductCategoryRow[]
    | ProductCategoryRow
    | null;
};

type SellerRow = {
  username: string | null;
  user_uuid: string | null;

};

/** Row shape returned from Supabase `product` table (snake_case columns) */
export type ProductRow = {
  prod_id: number | string;
  prod_name: string;
  prod_desc: string;
  prod_price: number | string;
  prod_stock_qty: number | string;
  prod_rating: number | string;
  prod_sold_qty: number | string | null;
  prod_image: string;
  prod_cat_link?: ProductCatLinkRow[] | null;
  // product_category_type?: ProductCategoryRow | ProductCategoryRow[] | null;
  user?: SellerRow | SellerRow[] | null;
};

function namesFromCategoryEmbed(
  pct: ProductCategoryRow[] | ProductCategoryRow | null | undefined,
): string[] {
  if (pct == null) {
    return [];
  }
  if (Array.isArray(pct)) {
    return pct
      .map((p) => p?.prod_cat_name)
      .filter((name): name is string => Boolean(name));
  }
  return pct.prod_cat_name ? [pct.prod_cat_name] : [];
}

export function productFromRow(row: ProductRow): ProductView {
  const category = (row.prod_cat_link ?? []).flatMap((link) =>
    namesFromCategoryEmbed(link.product_category_type),
  );

  const sellerValue = Array.isArray(row.user) ? row.user[0] : row.user;

  return {
    id: typeof row.prod_id === "string" ? Number(row.prod_id) : row.prod_id,
    name: row.prod_name,
    description: row.prod_desc,
    price:
      typeof row.prod_price === "string" ? Number(row.prod_price) : row.prod_price,
    category,
    image: row.prod_image,
    rating:
      typeof row.prod_rating === "string"
        ? Number(row.prod_rating)
        : row.prod_rating,
    seller: sellerValue?.username ?? "Unknown seller",
    seller_uuid: sellerValue?.user_uuid ?? "",
    quantitySold:
      typeof row.prod_sold_qty === "string"
        ? Number(row.prod_sold_qty)
        : (row.prod_sold_qty ?? 0),
    stockQuantity:
      typeof row.prod_stock_qty === "string"
        ? Number(row.prod_stock_qty)
        : row.prod_stock_qty,
  };
}
