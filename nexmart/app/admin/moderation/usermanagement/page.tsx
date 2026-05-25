"use client";


import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search } from "lucide-react";
import { User } from "../../types/users";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminUserManagementDashboard() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all")

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const res = await fetch("/api/admin/users");
            if (!res.ok) {
                throw new Error ("Failed to fetch users.");
            }

            const data = await res.json();

            setUsers(data.users || []);
            setTotalCount(data.totalCount || 0);

        } catch (error: any) {
            setErrorMessage(error.message || "Failed to load users.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (e: React.MouseEvent, userUuid: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        try {
            const res = await fetch(
                `/api/admin/users/${userUuid}`,
                { method: "DELETE"}
            );

            if (!res.ok) {
                throw new Error("Failed to delete user");
            }

            setUsers((prev) => prev.filter((u) => u.user_uuid !== userUuid));
            setTotalCount((prev) => Math.max(prev -1, 0));

        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete user.");
        }
    };


    const uniqueRoles = useMemo(() => {
        const allRoles = users.flatMap((u) => u.user_role?.role_name ?? []);
        return ["all", ...Array.from(new Set(allRoles)).sort()];
    }, [users]);

    const filteredUsers = useMemo(() => {
        let result = users;

        if (search.trim()) {
            const keyword = search.toLowerCase();
            result = result.filter((u) =>
                u.username?.toLowerCase().includes(keyword) ||
                u.email?.toLowerCase().includes(keyword) ||
                u.phone?.includes(keyword) ||
                u.user_role?.role_name?.some(r => r.toLowerCase().includes(keyword))
            );
        }

        if (roleFilter !== "all") {
            result = result.filter((u) => u.user_role?.role_name?.includes(roleFilter));
        }

        return result;
    }, [users, search, roleFilter]);



    return (
        <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
            <Link
                href="/admin/moderation"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
            >
                Back to Moderation
            </Link>
            <p className="text-sm text-gray-600">
                Total Users: <span className="font-medium">{totalCount}</span>
            </p>
            </div>
            <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search username / email / role..."
                    className="w-full rounded-2xl border px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                />
            </div>
        </div>

        <Tabs defaultValue="all" onValueChange={(val) => setRoleFilter(val)} className="w-full">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {uniqueRoles
                    .filter((r) => r !== "all")
                    .map((role) => (
                        <TabsTrigger key={role} value={role} className="capitalize">
                            {role}
                        </TabsTrigger>
                    ))}
            </TabsList>
        </Tabs>

        {errorMessage && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
            </div>
        )}

        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            {isLoading ? (
            <div className="p-6 text-sm text-gray-600">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No users found.</div>
            ) : (
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                <tr>
                    <th className="text-left px-5 py-3 font-medium">Username</th>
                    <th className="text-left px-5 py-3 font-medium">Email</th>
                    <th className="text-left px-5 py-3 font-medium">Role</th>
                    <th className="text-left px-5 py-3 font-medium">Phone</th>
                    <th className="text-right px-5 py-3 font-medium">Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((u) => (
                    <tr
                    key={u.user_uuid}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/moderation/usermanagement/${u.user_uuid}`)}
                    >
                    <td className="px-5 py-4 font-medium">{u.username}</td>
                    <td className="px-5 py-4 text-gray-700">{u.email}</td>
                    <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                            {(u.user_role?.role_name ?? []).length > 0 ? (
                                u.user_role?.role_name.map((role) => (
                                    <span
                                        key={role}
                                        className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize"
                                    >
                                        {role}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">-</span>
                            )}
                        </div>
                    </td>

                    {/* <td className="px-5 py-4">{u.last_active_role}</td> */}
                    <td className="px-5 py-4">{u.phone || "-"}</td>
                    <td className="px-5 py-4 text-right">
                        <button
                        onClick={(e) => handleDeleteUser(e, u.user_uuid)}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs text-white hover:bg-rose-700"
                        >
                        <Trash2 className="w-4 h-4" />
                        Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>

        <div className="flex justify-end">
            <button
            onClick={fetchUsers}
            className="rounded-2xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
            Refresh
            </button>
        </div>
        </div>
    );

}
