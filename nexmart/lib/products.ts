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

/** Row shape returned from Supabase `products` table (snake_case columns) */
export type ProductRow = {
  id: number | string;
  name: string;
  price: number | string;
  category: string;
  image: string;
  rating: number | string;
  seller: string;
  quantity_sold: number | string;
  stock_quantity: number | string;
};

export function productFromRow(row: ProductRow): Product {
  return {
    id: typeof row.id === "string" ? Number(row.id) : row.id,
    name: row.name,
    price: typeof row.price === "string" ? Number(row.price) : row.price,
    category: row.category,
    image: row.image,
    rating: typeof row.rating === "string" ? Number(row.rating) : row.rating,
    seller: row.seller,
    quantitySold:
      typeof row.quantity_sold === "string"
        ? Number(row.quantity_sold)
        : row.quantity_sold,
    stockQuantity:
      typeof row.stock_quantity === "string"
        ? Number(row.stock_quantity)
        : row.stock_quantity,
  };
}
