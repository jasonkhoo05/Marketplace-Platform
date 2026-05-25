"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

type Notification = {
    notification_id: number;
    seller_id: string;
    order_id: number;
    noti_title: string;
    noti_message: string;
    created_at: string;
    is_read: boolean;
};

export default function SellerNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    async function fetchNotifications() {
        try {
            const response = await fetch("/api/seller/notifications");
            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }

    async function markAsReadAndNavigate(notificationId: number) {
        await fetch(`/api/seller/notifications/${notificationId}`, {
            method: "PATCH",
        });
        setOpen(false);
        router.push("/seller/order");
    }

    async function clearAll() {
        await Promise.all(
            notifications.map((noti) =>
                fetch(`/api/seller/notifications/${noti.notification_id}`, {
                    method: "DELETE",
                })
            )
        );
        fetchNotifications();
    }

    const unreadCount = notifications.filter((noti) => !noti.is_read).length;

    return (
        <div className="relative ml-auto">
            <button
                onClick={() => setOpen(!open)}
                className="relative rounded-full p-2 hover:bg-slate-100"
            >
                <FiBell size={20} />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
                        ) : (
                            notifications.map((noti) => (
                                <div
                                    key={noti.notification_id}
                                    onClick={() => markAsReadAndNavigate(noti.notification_id)}
                                    className={`cursor-pointer border-b px-4 py-3 transition-colors hover:bg-slate-50 ${
                                        !noti.is_read ? "border-l-2 border-l-teal-500" : "border-l-2 border-l-transparent"
                                    }`}
                                >
                                    <p className="text-sm font-semibold text-slate-900">
                                        {noti.noti_title}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        {noti.noti_message}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Order #{noti.order_id}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
