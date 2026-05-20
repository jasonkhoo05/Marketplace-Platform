"use client";

import { useEffect, useState } from "react";
import { PackageSearch, UserPlus, FlagTriangleRight } from "lucide-react";
import { SectionCard, ModerationRequest } from "@/components/admin/SectionCard";


export default function ModerationDashboard() {

  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      const [modRes, userRes, reviewRes] = await Promise.all([
        fetch("/api/admin/products?limit=15"),
        fetch("/api/admin/users?limit=5"),
        fetch("/api/admin/reviews?limit=5"),
      ]);

      let modData: any[] = [];
      if (!modRes.ok) {
        const errorText = await modRes.text();
        console.warn("modRes failed.", errorText);
        setErrorMessage("Failed to load pending products from the database.");
      } else {
        const productRows = await modRes.json();
        modData = (productRows ?? []).map((product: any) => ({
          id: String(product.prod_id),
          type: "product" as const,
          status: product.prod_status || "pending",
          created_at: product.prod_created_at || new Date().toISOString(),
          details: {
            title: product.prod_name || "Unnamed product",
            description: product.prod_desc || "No description",
            image: product.prod_image || null,
            seller: product.user?.username ?? "Unknown seller",
            price: product.prod_price,
            stock: product.prod_stock_qty,
          },
        }));
      }

      let userData: any[] = [];
      if (!userRes.ok) {
        const errorText = await userRes.text();
        console.error("userRes failed:", errorText);
        setErrorMessage((prev) => prev ?? "Failed to load user moderation data.");
      } else {
        const userResData = await userRes.json();
        userData = userResData.users || [];
        setUserCount(userResData.totalCount || 0);
      }

      let reviewData: ModerationRequest[] = [];
      if (!reviewRes.ok) {
        console.warn("reviewRes failed:", await reviewRes.text());
      } else {
        const reviewRows = await reviewRes.json();
        reviewData = (reviewRows ?? []).map((review: any) => ({
          id: `${review.prod_id}-${review.user_uuid}`,
          type: "review" as const,
          status: "pending" as const,
          created_at: new Date().toISOString(),
          details: {
            prodId: review.prod_id,
            userId: review.user_uuid,
            productName: review.product?.prod_name || "Unknown product",
            productImage: review.product?.prod_image || null,
            username: review.user?.username || "Unknown user",
            review: review.review || "No review text",
          },
        }));
      }

      const mappedUsers = userData.map((u: any) => {
<<<<<<< HEAD
        const defaultAddress = Array.isArray(u.address) 
        ? u.address?.find((a: any) => a.is_default) || u.address?.[0] || null 
        : u.address || null;
=======
>>>>>>> 14ed6090b4dc80407f351f7b16480e629cdfee8c

        const addressList = Array.isArray(u.address) ? u.address : [];
        const defaultAddress = addressList.find((a:any) => a.is_default) || addressList[0] || null;

        const roles = Array.isArray(u.user_role?.role_name)
                      ? u.user_role.role_name
                      : [u.last_active_role || "buyer"];
        // const defaultAddress =
          // u.address?.find((a: any) => a.is_default) || u.address?.[0] || null;

        // const roles = u.user_role;
            // ?.map((item: any) => item.role?.role_name)
            // .filter(Boolean) || [];

        return {
          id: u.user_uuid,
          type: "user" as const,
          status: "approved" as const,
          details: {
            username: u.username,
            email: u.email,
            phone: u.phone || null,
            role: u.last_active_role || "buyer",
            roles: roles.length > 0 ? roles : [u.last_active_role || "buyer"],
            user_image: u.user_image || null,
            gender: u.gender || null,
            date_of_birth: u.date_of_birth || null,
            address: defaultAddress
              ? `${defaultAddress.address_line}, ${defaultAddress.city}, ${defaultAddress.postcode}`
              : null,
          },
          created_at: new Date().toISOString(),
        };
      });

      let finalModData: ModerationRequest[] = modData;
      let finalUserData: ModerationRequest[] = mappedUsers;

      if (!userRes.ok) {
        finalUserData = generateMockData().filter(
          (r): r is Extract<ModerationRequest, { type: "user" }> =>
            r.type === "user",
        );
      }

      setRequests([...finalModData, ...finalUserData, ...reviewData]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to load moderation data.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (id: string, status: "approved" | "rejected") => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const products = requests.filter((r) => r.type === "product").slice(0, 5);
  const users = requests.filter((r) => r.type === "user").slice(0, 5);
  const reviews = requests.filter((r) => r.type === "review").slice(0, 5);



  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        <SectionCard
          title="Pending Products"
          icon={PackageSearch}
          items={products}
          type="product"
          onAction={handleAction}
          isLoading={isLoading}
        />
        <SectionCard
          title="Registered Users"
          icon={UserPlus}
          items={users}
          type="user"
          onAction={handleAction}
          isLoading={isLoading}
          totalCount={userCount}
        />
        <SectionCard
          title="Flagged Reviews"
          icon={FlagTriangleRight}
          items={reviews}
          type="review"
          onAction={handleAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// Mock Data
function generateMockData(): ModerationRequest[] {
  return [
    {
      id: "p1",
      type: "product",
      status: "pending",
      details: {
        title: "Vintage Leather Jacket",
        description: "Needs review for authenticity.",
      },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "p2",
      type: "product",
      status: "pending",
      details: {
        title: "Sony Headphones",
        description: "Flagged for unusually low price.",
      },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "p3",
      type: "product",
      status: "pending",
      details: { title: "Handmade Ceramic Mug", description: "Reviewing images." },
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: "u1",
      type: "user",
      status: "pending",
      details: {
        username: "cool_seller99",
        reason: "Requires manual identity verification.",
      },
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "u2",
      type: "user",
      status: "pending",
      details: {
        username: "vintage_finds",
        reason: "High volume of sales registered quickly.",
      },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "r1",
      type: "report",
      status: "pending",
      details: {
        report_reason: "Inappropriate language in product description.",
        reported_by: "user123",
      },
      created_at: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: "r2",
      type: "report",
      status: "pending",
      details: { report_reason: "Counterfeit item.", reported_by: "buyer_joe" },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}
