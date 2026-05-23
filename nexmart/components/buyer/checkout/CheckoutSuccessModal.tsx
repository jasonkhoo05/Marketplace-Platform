import { FiCheckCircle } from "react-icons/fi";

type Props = {
  orderId: string;
  onContinueShopping: () => void;
  onViewOrders: () => void;
};

export default function CheckoutSuccessModal({
  orderId,
  onContinueShopping,
  onViewOrders,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <FiCheckCircle size={30} />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          Order Placed Successfully
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Thank you for your purchase. Your order has been placed successfully using
          the mock Google Pay checkout backend.
        </p>

        <p className="mt-3 text-sm font-medium text-slate-700">
          Order ID: {orderId}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onContinueShopping}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={onViewOrders}
            className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}