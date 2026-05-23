"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import ShippingInformation from "@/components/buyer/checkout/ShippingInformation";
import PaymentMethodSelector from "@/components/buyer/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/buyer/checkout/OrderSummary";
import CheckoutSuccessModal from "@/components/buyer/checkout/CheckoutSuccessModal";

import type {
  BuyerProfile,
  CheckoutCartItem,
  MockOrder,
  PaymentMethod,
} from "@/types/checkout";

const mockProfile: BuyerProfile = {
  username: "Demo Buyer",
  email: "buyer@example.com",
  phone: "+60 123456789",
  address: "123 Demo Street",
  city: "Kuala Lumpur",
  state: "Selangor",
  postalCode: "50000",
  country: "Malaysia",
};

const mockCartItems: CheckoutCartItem[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 49.99,
    quantity: 8,
    imageUrls: ["/placeholder.png"],
    seller: "NexMart Audio",
    cartQuantity: 1,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 89.99,
    quantity: 5,
    imageUrls: ["/placeholder.png"],
    seller: "NexMart Tech",
    cartQuantity: 2,
  },
];

export default function CheckoutPage() {
  const router = useRouter();

  const [profile] = useState<BuyerProfile>(mockProfile);
  const [items, setItems] = useState<CheckoutCartItem[]>(mockCartItems);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.price * item.cartQuantity,
      0
    );
  }, [items]);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  function hasCompleteShippingInfo() {
    return Boolean(
      profile.username &&
        profile.email &&
        profile.phone &&
        profile.address &&
        profile.city &&
        profile.state &&
        profile.postalCode &&
        profile.country
    );
  }

  async function placeOrder() {
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!hasCompleteShippingInfo()) {
      setErrorMessage(
        "Please complete your shipping information before placing the order."
      );
      return;
    }

    setIsPlacingOrder(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrderId = `ORD-${Date.now()}`;

      const newOrder: MockOrder = {
        id: newOrderId,
        buyerName: profile.username,
        buyerEmail: profile.email,
        buyerAddress: `${profile.address}, ${profile.city}, ${profile.state}, ${profile.postalCode}, ${profile.country}`,
        productName: items.map((item) => item.name).join(", "),
        productImage: items[0]?.imageUrls[0] ?? "",
        quantity: items.reduce((sum, item) => sum + item.cartQuantity, 0),
        totalPrice: total,
        orderDate: new Date().toISOString(),
        status: "Pending",
        paymentMethod,
      };

      const existingOrders = JSON.parse(
        sessionStorage.getItem("mockOrders") || "[]"
      ) as MockOrder[];

      sessionStorage.setItem(
        "mockOrders",
        JSON.stringify([newOrder, ...existingOrders])
      );

      setOrderId(newOrderId);
      setItems([]);
      setShowSuccessModal(true);
    } catch {
      setErrorMessage("Checkout failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <>
      <BuyerHeader />

      <main className="min-h-screen bg-slate-50 px-8 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review your shipping information, payment method, and order
              summary before placing your order.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-6">
              <ShippingInformation profile={profile} />

              <PaymentMethodSelector
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />
            </section>

            <OrderSummary
              items={items}
              subtotal={subtotal}
              tax={tax}
              total={total}
              isPlacingOrder={isPlacingOrder}
              canPlaceOrder={items.length > 0 && hasCompleteShippingInfo()}
              onPlaceOrder={placeOrder}
            />
          </div>

          {showSuccessModal && (
            <CheckoutSuccessModal
              orderId={orderId}
              onContinueShopping={() => router.push("/buyer/products")}
              onViewOrders={() => router.push("/buyer/orders")}
            />
          )}
        </div>
      </main>
    </>
  );
}