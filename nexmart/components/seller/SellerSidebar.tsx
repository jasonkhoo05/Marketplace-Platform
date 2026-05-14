"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { LogoutButton } from "../logout-button"
import { usePathname } from "next/navigation";

const menuItems = [
    { label: "Dashboard", href: "/seller/dashboard", icon: FiGrid },
    { label: "Products", href: "/seller/product", icon: FiBox },
    { label: "Orders", href: "/seller/order", icon: FiShoppingCart },
    { label: "Settings", href: "#", icon: FiSettings},
];

export default function SellerSidebar() {
    const pathname = usePathname();
    // const supabase = createClient();
    // const router = useRouter();

    // const [user, setUser] = useState<any>(null);

    // useEffect(() => {
    //     async function loadUser() {
    //         const { data } = await supabase.auth.getUser();
    //         setUser(data.user);
    //     }
    //     loadUser();
    // }, []);

    // const handleLogOut = async () => {
    //     const { error } = await supabase.auth.signOut();

    //     if (!error) {
    //         router.push("/login");
    //         router.refresh();
    //     }
    // }

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

                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
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


                {/* <button
                type="button"
                className="flex w-full items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600"
                onClick={handleLogOut}
                >

                    <FiLogOut size={15} />
                    Logout
                </button> */}
                <LogoutButton />
            </div>
        </aside>
    );
}