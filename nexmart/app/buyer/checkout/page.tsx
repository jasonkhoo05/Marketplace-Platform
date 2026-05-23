"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import BuyerHeader from "@/components/buyer/layout/BuyerHeader";
import ShippingInformation from "@/components/buyer/checkout/ShippingInformation";
import PaymentMethodSelector from "@/components/buyer/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/buyer/checkout/OrderSummary";
import CheckoutSuccessModal from "@/components/buyer/checkout/CheckoutSuccessModal";

import type {
  BuyerProfile,
  CheckoutCartItem,
  CheckoutResponse,
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

type ProfileApiResponse = {
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  error?: string;
};

type CheckoutApiError = {
  error?: string;
};

const emptyProfile: BuyerProfile = {
  username: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<BuyerProfile>(emptyProfile);
  const [profileLoaded, setProfileLoaded] = useState(false);
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
    async function loadCheckoutData() {
      setIsLoadingCart(true);
      setErrorMessage("");

      try {
        const [profileRes, cartRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/cart", { cache: "no-store" }),
        ]);

        if (profileRes.status === 401 || cartRes.status === 401) {
          router.push("/login");
          return;
        }

        const profileData = (await profileRes.json()) as ProfileApiResponse;
        const cartData = (await cartRes.json()) as CartApiResponse;

        if (!profileRes.ok) {
          throw new Error(profileData.error ?? "Failed to load profile.");
        }

        if (!cartRes.ok) {
          throw new Error(cartData.error ?? "Failed to load cart items.");
        }

        setProfile({
          username: profileData.username ?? "",
          email: profileData.email ?? "",
          phone: profileData.phone ?? "",
          address: profileData.address ?? "",
          city: profileData.city ?? "",
          postalCode: profileData.postcode ?? "",
        });
        setProfileLoaded(true);

        setItems(
          (cartData.items ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            seller: item.seller,
            quantity: item.quantity,
            stockQuantity: item.stockQuantity,
          })),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load checkout.";

        setErrorMessage(message);
      } finally {
        setIsLoadingCart(false);
      }
    }

    loadCheckoutData();
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
        profile.postalCode,
    );
  }

  async function clearCartAfterSuccessfulOrder() {
    try {
      await fetch("/api/cart", { method: "DELETE" });
    } catch {
      // Order already placed in the database.
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
        "Please complete your shipping address on your profile before placing the order.",
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
          paymentMethod,
        }),
      });

      const data = (await response.json()) as CheckoutResponse & CheckoutApiError;

      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed. Please try again.");
      }

      await clearCartAfterSuccessfulOrder();

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
              Review your delivery address, payment method, and order summary.
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

          {profileLoaded && !hasCompleteShippingInfo() && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your profile is missing delivery details. Please update your{" "}
              <Link href="/profile" className="font-semibold underline">
                profile
              </Link>{" "}
              before checkout.
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
