"use client";

import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();

  // Default to Dashboard
  let title = "Admin Dashboard";
  let subtitle = "Overview of your platform's performance and key metrics.";

  if (pathname.startsWith("/admin/moderation/usermanagement")) {
    title = "User Management";
    subtitle = "Manage and remove users from the system.";
  }
  else if (pathname.startsWith("/admin/moderation") || pathname.startsWith("/admin/approval")) {
    title = "Admin Moderation";
    subtitle = "Review and manage users, product listings and reported content.";
  } else if (pathname.startsWith("/admin/settings")) {
    title = "System Settings";
    subtitle = "Configure platform-wide settings and preferences.";
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </header>
  );
}
