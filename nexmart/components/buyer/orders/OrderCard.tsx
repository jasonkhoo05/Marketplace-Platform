import type { MockOrder } from "@/types/checkout";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  order: MockOrder;
  onDelete: (orderId: string) => void;
};

export default function OrderCard({ order,onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Order #{order.id}
            </h2>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
              {order.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>

        <p className="whitespace-nowrap text-lg font-bold text-teal-700">
          ${order.totalPrice.toFixed(2)}
        </p>
      </div>

      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
        <Info label="Buyer" value={order.buyerName} />
        <Info label="Email" value={order.buyerEmail} />
        <Info label="Product" value={order.productName} />
        <Info label="Quantity" value={String(order.quantity)} />
        <Info label="Payment Method" value={order.paymentMethod} />
        <Info label="Shipping Address" value={order.buyerAddress} />
      </div>

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onDelete(order.id)}
          className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <FiTrash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{value}</p>
    </div>
  );
}

function formatPaymentMethod(value: string) {
    if (value === "card") return "Credit / Debit Card";
    if (value === "paypal") return "PayPal";
    if (value === "cash") return "Cash on Delivery";
    return value;
  }