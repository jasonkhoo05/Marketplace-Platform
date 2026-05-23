import { NextRequest, NextResponse } from "next/server";
import type {
  BuyerProfile,
  CheckoutCartItem,
  CheckoutRequestBody,
  CheckoutResponse,
  MockOrder,
  PaymentMethod,
} from "@/types/checkout";

const SUPPORTED_PAYMENT_METHODS: PaymentMethod[] = ["google_pay"];
const TAX_RATE = 0.08;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function hasCompleteShippingInfo(
  profile: BuyerProfile | undefined,
): profile is BuyerProfile {
  if (!profile) return false;

  return (
    isNonEmptyString(profile.username) &&
    isNonEmptyString(profile.email) &&
    isNonEmptyString(profile.phone) &&
    isNonEmptyString(profile.address) &&
    isNonEmptyString(profile.city) &&
    isNonEmptyString(profile.state) &&
    isNonEmptyString(profile.postalCode) &&
    isNonEmptyString(profile.country)
  );
}

function isSupportedPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    SUPPORTED_PAYMENT_METHODS.includes(value as PaymentMethod)
  );
}

function validateCheckoutItems(
  items: CheckoutCartItem[] | undefined,
): string | null {
  if (!Array.isArray(items) || items.length === 0) {
    return "Your cart is empty.";
  }

  for (const item of items) {
    if (!isPositiveWholeNumber(item.id)) {
      return "One of the cart items has an invalid product ID.";
    }

    if (!isNonEmptyString(item.name)) {
      return "One of the cart items is missing a product name.";
    }

    if (!isValidPrice(item.price)) {
      return `Invalid price for ${item.name}.`;
    }

    if (!isPositiveWholeNumber(item.quantity)) {
      return `Invalid quantity for ${item.name}.`;
    }

    if (!isPositiveWholeNumber(item.stockQuantity)) {
      return `${item.name} is out of stock.`;
    }

    if (item.quantity > item.stockQuantity) {
      return `Only ${item.stockQuantity} unit(s) of ${item.name} are available.`;
    }
  }

  return null;
}

function formatAddress(profile: BuyerProfile) {
  return `${profile.address}, ${profile.city}, ${profile.state}, ${profile.postalCode}, ${profile.country}`;
}

function createOrderId() {
  return `ORD-${Date.now()}`;
}

function createMockGooglePayTransactionId() {
  return `GPAY-${Date.now()}`;
}

async function simulateGooglePayPayment() {
  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    success: true,
    transactionId: createMockGooglePayTransactionId(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CheckoutRequestBody>;
    const { profile, items, paymentMethod } = body;

    if (!hasCompleteShippingInfo(profile)) {
      return NextResponse.json(
        {
          error:
            "Please complete your shipping information before placing the order.",
        },
        { status: 400 },
      );
    }

    if (!isSupportedPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { error: "Google Pay is currently the only supported payment method." },
        { status: 400 },
      );
    }

    const itemValidationError = validateCheckoutItems(items);

    if (itemValidationError) {
      return NextResponse.json({ error: itemValidationError }, { status: 400 });
    }

    const checkoutItems = items as CheckoutCartItem[];

    const paymentResult = await simulateGooglePayPayment();

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: "Google Pay payment failed. No order was created." },
        { status: 402 },
      );
    }

    const orderItems = checkoutItems.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      seller: item.seller,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = subtotal * TAX_RATE;
    const totalPrice = subtotal + tax;

    const order: MockOrder = {
      id: createOrderId(),
      buyerName: profile.username,
      buyerEmail: profile.email,
      buyerAddress: formatAddress(profile),
      productName: orderItems.map((item) => item.name).join(", "),
      productImage: orderItems[0]?.image ?? "",
      quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      totalPrice,
      orderDate: new Date().toISOString(),
      status: "Pending",
      paymentMethod,
      paymentStatus: "Paid",
      paymentTransactionId: paymentResult.transactionId,
      items: orderItems,
      confirmationEmailSent: true,
      sellerNotificationSent: true,
      stockUpdateSimulated: true,
    };

    const response: CheckoutResponse = {
      message: "Order placed successfully using the mock buyer checkout backend.",
      order,
      emailMessage: `Mock confirmation email sent to ${profile.email}.`,
      sellerNotificationMessage:
        "Mock seller notification created for each seller in this order.",
      stockUpdateMessage:
        "Mock stock reduction completed. Real product stock update will be connected by the database teammate later.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Checkout failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}