export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  seller: string;
  quantitySold: number;
  stockQuantity: number;
};

type ProductCategoryRow = {
  prod_cat_name: string | null;
};

type SellerRow = {
  username: string | null;
};

/** Row shape returned from Supabase `product` table (snake_case columns) */
export type ProductRow = {
  prod_id: number | string;
  prod_name: string;
  prod_price: number | string;
  prod_stock_qty: number | string;
  prod_rating: number | string;
  prod_sold_qty: number | string | null;
  prod_image: string;
  product_category_type?: ProductCategoryRow | ProductCategoryRow[] | null;
  user?: SellerRow | SellerRow[] | null;
};

export function productFromRow(row: ProductRow): Product {
  const categoryValue = Array.isArray(row.product_category_type)
    ? row.product_category_type[0]
    : row.product_category_type;

  const sellerValue = Array.isArray(row.user) ? row.user[0] : row.user;

  return {
    id: typeof row.prod_id === "string" ? Number(row.prod_id) : row.prod_id,
    name: row.prod_name,
    price:
      typeof row.prod_price === "string" ? Number(row.prod_price) : row.prod_price,
    category: categoryValue?.prod_cat_name ?? "Uncategorized",
    image: row.prod_image,
    rating:
      typeof row.prod_rating === "string"
        ? Number(row.prod_rating)
        : row.prod_rating,
    seller: sellerValue?.username ?? "Unknown seller",
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
