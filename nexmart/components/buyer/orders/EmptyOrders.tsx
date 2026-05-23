import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

export default function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <FiShoppingBag size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No orders yet
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Once you place an order, it will appear here.
      </p>

      <Link
        href="/buyer/products"
        className="mt-6 inline-block rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
}