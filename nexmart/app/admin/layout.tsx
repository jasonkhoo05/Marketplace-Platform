import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Suspense fallback={<div className="w-60" />}>
        <AdminSidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-h-screen ml-60">

        <Suspense fallback={<div className="h-16" />}>
          <AdminHeader />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
