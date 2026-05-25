import { FiLock } from "react-icons/fi";
import type { CheckoutCartItem } from "@/types/checkout";

type Props = {
  items: CheckoutCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  isPlacingOrder: boolean;
  canPlaceOrder: boolean;
  onPlaceOrder: () => void;
};

export default function OrderSummary({
  items,
  subtotal,
  tax,
  total,
  isPlacingOrder,
  canPlaceOrder,
  onPlaceOrder,
}: Props) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

      <div className="mt-6 space-y-4 border-b border-slate-100 pb-6">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">{item.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Seller: {item.seller}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Qty: {item.quantity}
                </p>
              </div>

              <span className="font-semibold text-slate-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 space-y-4 border-b border-slate-100 pb-6 text-sm">
        <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <Row label="Shipping" value="Free" green />
        <Row label="Tax" value={`$${tax.toFixed(2)}`} />
      </div>

      <div className="mt-6 flex justify-between">
        <span className="text-lg font-bold text-slate-900">Total</span>
        <span className="text-lg font-bold text-teal-700">
          ${total.toFixed(2)}
        </span>
      </div>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canPlaceOrder || isPlacingOrder}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <FiLock />
        {isPlacingOrder ? "Placing Order..." : "Place Order"}
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <FiLock />
        Secure checkout simulation
      </p>
    </aside>
  );
}

function Row({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between text-slate-500">
      <span>{label}</span>
      <span
        className={`font-medium ${
          green ? "text-green-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}