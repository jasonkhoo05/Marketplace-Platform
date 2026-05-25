"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FiBox,
    FiGrid,
    FiSettings,
    FiShoppingCart,
} from "react-icons/fi";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../logout-button";
import UserProfileCard from "@/components/ui/UserProfileCard";
import RoleSwitchButton from "@/components/RoleSwitchButton";

const menuItems = [
    { label: "Dashboard", href: "/seller/dashboard", icon: FiGrid },
    { label: "Products", href: "/seller/product", icon: FiBox },
    { label: "Orders", href: "/seller/order", icon: FiShoppingCart },
    { label: "Settings", href: "#", icon: FiSettings},
];

export default function SellerSidebar() {
    const pathname = usePathname();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((r) => r.json())
            .then((data) => {
                setUsername(data.username || "");
                setEmail(data.email || "");
                setAvatarUrl(data.user_image || null);
            })
            .catch(() => {});
    }, []);

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
                <div className="grad" style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "white" }}>
                    N
                </div>
                <span className="grad-text text-lg font-bold leading-none">NexMart</span>
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
                <div className="mb-4">
                    <UserProfileCard username={username} email={email} avatarUrl={avatarUrl} />
                </div>

                <RoleSwitchButton
                    targetRole="buyer"
                    href="/buyer/products"
                    label="Switch to Buyer"
                />

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