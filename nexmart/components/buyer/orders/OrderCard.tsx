import type { MockOrder } from "@/types/checkout";

type Props = {
  order: MockOrder;
};

export default function OrderCard({ order }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
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

        <p className="text-lg font-bold text-teal-700">
          ${order.totalPrice.toFixed(2)}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 md:grid-cols-2">
        <Info label="Buyer" value={order.buyerName} />
        <Info label="Email" value={order.buyerEmail} />
        <Info label="Product" value={order.productName} />
        <Info label="Quantity" value={String(order.quantity)} />
        <Info label="Payment Method" value={order.paymentMethod} />

        <div className="md:col-span-2">
          <Info label="Shipping Address" value={order.buyerAddress} />
        </div>
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