// components/RoleSwitchButton.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const [isSwitching, setIsSwitching] = useState(false);

  // Reset the loading state whenever the route or target role changes.
  // This prevents the button from staying stuck as "Switching..."
  // after buyer -> seller -> buyer navigation.
  useEffect(() => {
    setIsSwitching(false);
  }, [pathname, targetRole]);

  async function handleSwitch() {
    if (isSwitching) return;

    setIsSwitching(true);

    try {
      const response = await fetch("/api/user/active-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_active_role: targetRole }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to switch mode");
      }

      router.push(href);

      // Reset immediately as well, in case Next.js keeps this component mounted.
      setIsSwitching(false);
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
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiRepeat size={15} />
      {isSwitching ? "Switching..." : label}
    </button>
  );
}