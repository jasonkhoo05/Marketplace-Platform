"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBox, FiShoppingCart } from "react-icons/fi";
import ProductFilters from "@/components/buyer/products/ProductFilters";
import RoleSwitchButton from "@/components/RoleSwitchButton";
import UserProfileCard from "@/components/ui/UserProfileCard";
import { LogoutButton } from "@/components/logout-button";

type BuyerSidebarProps = {
  minPrice: string;
  maxPrice: string;
  minRating: string;
  inStockOnly: boolean;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
};

const menuItems = [
  { label: "Products", href: "/buyer/products", icon: FiBox },
  { label: "Cart", href: "/buyer/cart", icon: FiShoppingCart },
  { label: "Orders", href: "/buyer/orders", icon: FiShoppingCart },
];

export default function BuyerSidebar({
  minPrice,
  maxPrice,
  minRating,
  inStockOnly,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onInStockOnlyChange,
  onClearFilters,
}: BuyerSidebarProps) {
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

      <nav className="space-y-2 px-3 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
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

      <div className="flex-1 overflow-y-auto px-3 pb-5">
        <ProductFilters
          minPrice={minPrice}
          maxPrice={maxPrice}
          minRating={minRating}
          inStockOnly={inStockOnly}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
          onMinRatingChange={onMinRatingChange}
          onInStockOnlyChange={onInStockOnlyChange}
          onClearFilters={onClearFilters}
        />
      </div>

      <div className="border-t border-slate-100 p-4">
      <div className="mb-4">
        <UserProfileCard
            username={username}
            email={email}
            avatarUrl={avatarUrl}
        />
        </div>

        <RoleSwitchButton
          targetRole="seller"
          href="/seller/dashboard"
          label="Switch to Seller"
        />

        <LogoutButton />
      </div>
    </aside>
  );
}