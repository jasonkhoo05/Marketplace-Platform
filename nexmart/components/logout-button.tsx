"use client";

import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="flex w-full items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600"
    >
      <FiLogOut size={15} />
      Logout
    </button>
  );
}
