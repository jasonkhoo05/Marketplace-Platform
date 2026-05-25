"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiShield, FiSettings } from "react-icons/fi";
import { LogoutButton } from "../logout-button";
import UserProfileCard from "@/components/ui/UserProfileCard";

const menuItems = [
    { label: "Dashboard", href: "#", icon: FiGrid, disabled: false, activePaths: [] },
    { label: "Moderation", href: "/admin/moderation", icon: FiShield, disabled: false, activePaths: ["/admin/moderation", "/admin/approval", "/admin/reviews", "/admin/usermanagement"] },
    { label: "Settings", href: "#", icon: FiSettings, disabled: false, activePaths: [] },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [adminName, setAdminName] = useState<string>("");
    const [adminEmail, setAdminEmail] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((r) => r.json())
            .then((data) => {
                setAdminName(data.username || "");
                setAdminEmail(data.email || "");
                setAvatarUrl(data.user_image || null);
            })
            .catch(() => {});
    }, []);

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-slate-200 bg-white z-50">
            <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
                <div className="grad" style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "white" }}>
                    N
                </div>
                <span className="grad-text text-lg font-bold leading-none">NexMart</span>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.activePaths.some((p) => pathname.startsWith(p));

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
                <div className="mb-4">
                    <UserProfileCard username={adminName} email={adminEmail} avatarUrl={avatarUrl} />
                </div>

                <LogoutButton />
            </div>
        </aside>
    );
}
