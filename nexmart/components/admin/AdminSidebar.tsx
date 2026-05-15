"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid,
    FiShield,
    FiSettings,
    FiHome,
    FiUser,
    FiBox
} from "react-icons/fi";
import { LogoutButton } from "../logout-button";

const menuItems = [
    { label: "Dashboard", href: "#", icon: FiGrid, disabled: false, active: false },
    { label: "Moderation", href: "/admin/moderation", icon: FiShield, disabled: false, active: true },
    { label: "Settings", href: "#", icon: FiSettings, disabled: false, active: false },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const supabase = createClient();

    const [adminName, setAdminName] = useState<string>("Loading...");
    const [adminEmail, setAdminEmail] = useState<string>("loading...");

    useEffect(() => {
        async function loadAdminUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setAdminEmail(user.email || "No email");

                // Fetch the username from database
                const { data: userData } = await supabase
                    .from("user")
                    .select("username")
                    .eq("user_uuid", user.id)
                    .single();

                if (userData?.username) {
                    setAdminName(userData.username);
                } else {
                    setAdminName("Admin User");
                }
            } else {
                setAdminName("Admin User");
                setAdminEmail("Not logged in");
            }
        }
        loadAdminUser();
    }, [supabase]);

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-slate-200 bg-white z-50">
            <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white">
                    <FiBox size={18} />
                </div>
                <span className="text-lg font-bold text-slate-900">NexMart</span>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    if (item.disabled) {
                        return (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed"
                                title={`${item.label} (Coming Soon)`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                ? "bg-teal-700 text-white shadow-sm"
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <FiUser size={18} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 truncate" title={adminName}>
                            {adminName}
                        </p>
                        <p className="text-xs text-slate-500 truncate" title={adminEmail}>
                            {adminEmail}
                        </p>
                    </div>
                </div>

                <Link
                    href="/"
                    className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-teal-700"
                >
                    <FiHome size={15} />
                    Back to Store
                </Link>

                <LogoutButton />
            </div>
        </aside>
    );
}
