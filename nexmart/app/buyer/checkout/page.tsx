"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import ShippingInformation from "@/components/buyer/checkout/ShippingInformation";
import PaymentMethodSelector from "@/components/buyer/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/buyer/checkout/OrderSummary";
import CheckoutSuccessModal from "@/components/buyer/checkout/CheckoutSuccessModal";

import type {
  BuyerProfile,
  CheckoutCartItem,
  CheckoutResponse,
  MockOrder,
  PaymentMethod,
} from "@/types/checkout";

type CartApiItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
  stockQuantity: number;
};

type CartApiResponse = {
  items?: CartApiItem[];
  error?: string;
};

type CheckoutApiError = {
  error?: string;
};

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

export default function CheckoutPage() {
  const router = useRouter();

  const [profile] = useState<BuyerProfile>(mockProfile);
  const [items, setItems] = useState<CheckoutCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("google_pay");

  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    async function loadCartItems() {
      setIsLoadingCart(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
        });
        const data = (await response.json()) as CartApiResponse;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load cart items.");
        }

        const checkoutItems: CheckoutCartItem[] = (data.items ?? []).map(
          (item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            seller: item.seller,
            quantity: item.quantity,
            stockQuantity: item.stockQuantity,
          }),
        );

        setItems(checkoutItems);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load cart items.";

        setErrorMessage(message);
      } finally {
        setIsLoadingCart(false);
      }
    }

    loadCartItems();
  }, [router]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        profile.country,
    );
  }

  function saveMockOrderToBrowser(order: MockOrder) {
    const existingOrders = JSON.parse(
      sessionStorage.getItem("mockOrders") || "[]",
    ) as MockOrder[];

    sessionStorage.setItem(
      "mockOrders",
      JSON.stringify([order, ...existingOrders]),
    );
  }

  async function clearCartAfterSuccessfulMockOrder() {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
      });
    } catch {
      // Order placement already succeeded.
      // If cart clearing fails, do not undo the mock order.
    }
  }

  async function placeOrder() {
    setErrorMessage("");
    setSuccessMessage("");

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!hasCompleteShippingInfo()) {
      setErrorMessage(
        "Please complete your shipping information before placing the order.",
      );
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await fetch("/api/buyer/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          items,
          paymentMethod,
        }),
      });

      const data = (await response.json()) as CheckoutResponse &
        CheckoutApiError;

      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed. Please try again.");
      }

      saveMockOrderToBrowser(data.order);
      await clearCartAfterSuccessfulMockOrder();

      setSuccessMessage(
        `${data.emailMessage} ${data.sellerNotificationMessage} ${data.stockUpdateMessage}`,
      );
      setOrderId(data.order.id);
      setItems([]);
      setShowSuccessModal(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again.";

      setErrorMessage(message);
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
              Review your shipping information, Google Pay method, and order
              summary before placing your order.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {isLoadingCart ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading checkout details...
            </div>
          ) : (
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
          )}

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