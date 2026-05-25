import type {
  MockOrder,
  MockOrderItem,
  MockOrderStatus,
  PaymentMethod,
} from "@/types/checkout";

export const TAX_RATE = 0.08;

export type DbOrderRow = {
  order_id: number;
  order_date: string;
  order_status: string;
  order_quantity: number | string | null;
  order_price: number | string;
  order_buyer_address: number;
  seller_id: string;
  buyer_id: string | null;
  prod_id: number | null;
  payment_method: string | null;
  payment_transaction_id: string | null;
  payment_status: string | null;
  product?: {
    prod_name: string | null;
    prod_image: string | null;
  } | null;
  address?: {
    address_line: string | null;
    city: string | null;
    postcode: string | null;
  } | null;
};

export function formatBuyerAddress(
  address?: DbOrderRow["address"] | null,
): string {
  if (!address) return "Address not available";
  const parts = [address.address_line, address.city, address.postcode].filter(
    Boolean,
  );
  return parts.join(", ");
}

export function groupOrderRowsToMockOrders(
  rows: DbOrderRow[],
  buyerName: string,
  buyerEmail: string,
): MockOrder[] {
  const groups = new Map<string, DbOrderRow[]>();

  for (const row of rows) {
    const key =
      row.payment_transaction_id?.trim() || `legacy-${row.order_id}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const orders: MockOrder[] = [];

  for (const [groupKey, groupRows] of groups) {
    const sorted = [...groupRows].sort((a, b) => a.order_id - b.order_id);
    const first = sorted[0];
    const items: MockOrderItem[] = sorted.map((row) => {
      const quantity = Number(row.order_quantity ?? 0);
      const lineTotal = Number(row.order_price ?? 0);
      const unitPrice =
        quantity > 0 ? Number((lineTotal / quantity).toFixed(2)) : lineTotal;

      return {
        productId: row.prod_id ?? 0,
        name: row.product?.prod_name ?? "Product",
        price: unitPrice,
        image: row.product?.prod_image ?? "",
        seller: "",
        quantity,
        lineTotal,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const totalPrice = Number((subtotal + tax).toFixed(2));
    const displayId = first.payment_transaction_id
      ? `ORD-${first.payment_transaction_id.replace(/^GPAY-/, "")}`
      : `ORD-${first.order_id}`;

    orders.push({
      id: displayId,
      groupKey,
      buyerName,
      buyerEmail,
      buyerAddress: formatBuyerAddress(first.address),
      productName: items.map((i) => i.name).join(", "),
      productImage: items[0]?.image ?? "",
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      totalPrice,
      orderDate: first.order_date,
      status: first.order_status as MockOrderStatus,
      paymentMethod: (first.payment_method ?? "google_pay") as PaymentMethod,
      paymentStatus:
        first.payment_status === "Failed"
          ? "Failed"
          : first.payment_status === "Pending"
            ? "Pending"
            : "Paid",
      paymentTransactionId: first.payment_transaction_id ?? "",
      items,
      confirmationEmailSent: true,
      sellerNotificationSent: true,
      stockUpdateSimulated: false,
      orderIds: sorted.map((r) => r.order_id),
    });
  }

  return orders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
}
