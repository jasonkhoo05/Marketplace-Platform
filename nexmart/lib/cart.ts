export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  stockQuantity: number;
};

export type CartResponse = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};

type SellerRow = {
  username: string | null;
};

type ProductEmbed = {
  prod_id: number;
  prod_name: string;
  prod_price: number | string;
  prod_image: string;
  prod_stock_qty: number | string;
  user?: SellerRow | SellerRow[] | null;
};

export type CartItemRow = {
  quantity: number | string;
  product: ProductEmbed | ProductEmbed[] | null;
};

function toNumber(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

function sellerName(product: ProductEmbed): string {
  const seller = Array.isArray(product.user) ? product.user[0] : product.user;
  return seller?.username ?? "Unknown seller";
}

export function mapCartRows(rows: CartItemRow[] | null): CartItem[] {
  if (!rows?.length) {
    return [];
  }

  return rows.flatMap((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;

    if (!product) {
      return [];
    }

    return [
      {
        id: product.prod_id,
        name: product.prod_name,
        price: toNumber(product.prod_price),
        image: product.prod_image,
        seller: sellerName(product),
        quantity: toNumber(row.quantity),
        stockQuantity: toNumber(product.prod_stock_qty),
      },
    ];
  });
}

export function buildCartResponse(items: CartItem[]): CartResponse {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export const CART_ITEM_SELECT = `
  cart_item_id,
  quantity,
  product:prod_id (
    prod_id,
    prod_name,
    prod_price,
    prod_image,
    prod_stock_qty,
    user!product_seller_uuid_fkey (username)
  )
`;
