"use client";

import { useEffect, useState } from "react";
import { PackageSearch, UserPlus, FlagTriangleRight } from "lucide-react";
import { SectionCard, ModerationRequest } from "@/components/admin/SectionCard";

export default function ModerationDashboard() {
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/moderation?status=pending&limit=15");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      // If DB is empty, use mock data for demonstration
      if (data.length === 0) {
        setRequests(generateMockData());
      } else {
        setRequests(data);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback to mock data on error
      setRequests(generateMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setRequests((prev) => prev.filter((req) => req.id !== id));

    try {
      const res = await fetch(`/api/admin/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      fetchRequests();
    }
  };

  const products = requests.filter((r) => r.type === "product").slice(0, 5);
  const users = requests.filter((r) => r.type === "user").slice(0, 5);
  const reports = requests.filter((r) => r.type === "report").slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        />
        <SectionCard
          title="Reported Content"
          icon={FlagTriangleRight}
          items={reports}
          type="report"
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
