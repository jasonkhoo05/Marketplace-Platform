"use client";

import { useEffect, useState } from "react";
import { FiBell, FiTrash2 } from "react-icons/fi";

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
    const [notifications, setNotifications] = useState<Notification[]>([
    {
        notification_id: 1,
        seller_id: "1",
        order_id: 101,
        noti_title: "New order received",
        noti_message:
            "Order #101 placed by John Doe for Wireless Headphones, quantity 2",
        created_at: new Date().toISOString(),
        is_read: false,
    },
    ]);
    const [open, setOpen] = useState(false);
    /*
    useEffect(() => {   
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5000);

        return () => clearInterval(interval);
    }, []);
    */
    async function fetchNotifications() {
        try {
            const response = await fetch("/api/seller/notifications");
            const data = await response.json();

            setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }

    async function markAsRead(notificationId: number) {
        await fetch(`/api/seller/notifications/${notificationId}`, {
            method: "PATCH",
        });

        fetchNotifications();
    }

    async function deleteNotification(notificationId: number) {
        await fetch(`/api/seller/notifications/${notificationId}`, {
            method: "DELETE",
        });

        fetchNotifications();
    }

    const unreadCount = notifications.filter((noti) => !noti.is_read).length;

    return (
        <div className="relative">
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
                    <div className="border-b px-4 py-3">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500">
                                No notifications yet.
                            </p>
                        ) : (
                            notifications.map((noti) => (
                                <div
                                    key={noti.notification_id}
                                    onClick={() => markAsRead(noti.notification_id)}
                                    className={`cursor-pointer border-b px-4 py-3 ${
                                        !noti.is_read
                                            ? "bg-teal-50"
                                            : "bg-white"
                                    }`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <div>
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

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(noti.notification_id);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}