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
  state: string;
  postalCode: string;
  country: string;
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
  profile: BuyerProfile;
  items: CheckoutCartItem[];
  paymentMethod: PaymentMethod;
};

export type CheckoutResponse = {
  message: string;
  order: MockOrder;
  emailMessage: string;
  sellerNotificationMessage: string;
  stockUpdateMessage: string;
};