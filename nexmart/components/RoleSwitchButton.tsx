"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiRepeat } from "react-icons/fi";

type RoleSwitchButtonProps = {
  targetRole: "buyer" | "seller";
  href: string;
  label: string;
};

export default function RoleSwitchButton({
  targetRole,
  href,
  label,
}: RoleSwitchButtonProps) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  async function handleSwitch() {
    if (isSwitching) return;

    setIsSwitching(true);

    try {
      const response = await fetch("/api/user/active-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_active_role: targetRole }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to switch mode");
      }

      router.push(href);
    } catch (error) {
      console.error(error);
      setIsSwitching(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isSwitching}
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:opacity-60"
    >
      <FiRepeat size={15} />
      {isSwitching ? "Switching..." : label}
    </button>
  );
}
