import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("user")
    .select("user_uuid")
    .eq("user_uuid", user.id)
    .maybeSingle();

  if (!userData) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return <>{children}</>;
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
