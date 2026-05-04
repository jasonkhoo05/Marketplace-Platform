"use client";

import Link from "next/link";
import {
    FiBox,
    FiGrid,
    FiHome,
    FiLogOut,
    FiSettings,
    FiShoppingCart,
    FiUser,
} from "react-icons/fi";

const menuItems = [
    { label: "Dashboard", href: "/seller/dashboard", icon: FiGrid, active: true },
    { label: "Products", href: "/seller/dashboard", icon: FiBox, active: false },
    { label: "Orders", href: "#", icon: FiShoppingCart, active: false },
    { label: "Settings", href: "#", icon: FiSettings, active: false },
];

export default function SellerSidebar() {
    return (
        <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white">
                    <FiBox size={18} />
                </div>
                <span className="text-lg font-bold text-slate-900">NexMart</span>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-5">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${item.active
                                    ? "bg-teal-700 text-white"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-100 p-4">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <FiUser size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Seller Name</p>
                        <p className="text-xs text-slate-500">seller@shop.com</p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-teal-700"
                >
                    <FiHome size={15} />
                    Back to Store
                </Link>

                <button className="flex w-full items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600">
                    <FiLogOut size={15} />
                    Logout
                </button>
            </div>
        </aside>
    );
}