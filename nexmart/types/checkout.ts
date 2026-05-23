export const PAYMENT_METHODS = [
  {
    id: "google_pay",
    label: "Google Pay",
    description:
      "Pay using Google Pay. This is currently simulated for the buyer checkout flow.",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

export type CheckoutCartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  stockQuantity: number;
};

export type BuyerProfile = {
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  /** Optional (address table uses postcode only). */
  state?: string;
  /** Maps to address.postcode when loading from profile. */
  postalCode: string;
  country?: string;
};

export type MockOrderStatus =
  | "Cancelled"
  | "Shipped"
  | "Completed"
  | "Processing"
  | "Pending"
  | "Refunded";

export type MockPaymentStatus = "Paid" | "Failed" | "Pending";

export type MockOrderItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  lineTotal: number;
};

export type MockOrder = {
  id: string;
  /** Groups DB rows from one checkout (payment_transaction_id). */
  groupKey?: string;
  /** Underlying order_id values for cancel/delete APIs. */
  orderIds?: number[];
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  productName: string;
  productImage: string;
  quantity: number;
  subtotal: number;
  tax: number;
  totalPrice: number;
  orderDate: string;
  status: MockOrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: MockPaymentStatus;
  paymentTransactionId: string;
  items: MockOrderItem[];
  confirmationEmailSent: boolean;
  sellerNotificationSent: boolean;
  stockUpdateSimulated: boolean;
};

export type CheckoutRequestBody = {
  paymentMethod: PaymentMethod;
};

export type CheckoutResponse = {
  message: string;
  order: MockOrder;
  emailMessage: string;
  sellerNotificationMessage: string;
  stockUpdateMessage: string;
};