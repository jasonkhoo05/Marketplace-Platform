import CartBadge from "@/components/buyer/CartBadge";
import Link from "next/link";
import { FiBox, FiSearch, FiUser } from "react-icons/fi";

export default function BuyerHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/buyer/products" className="flex w-60 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white">
            <FiBox size={18} />
          </div>

          <span className="text-lg font-bold text-slate-900">NexMart</span>
        </Link>

        <div className="flex w-[420px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
          <FiSearch size={18} className="text-slate-400" />
          <input
            placeholder="Search for products..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex w-60 items-center justify-end gap-5">
          <Link
            href="/buyer/profile"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-teal-700"
          >
            <FiUser size={18} />
            Profile
          </Link>

          <CartBadge />
        </div>
      </div>
    </header>
  );
}