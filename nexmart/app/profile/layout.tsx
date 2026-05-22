
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Secure server-side check before rendering the profile page layout
async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there's no session, boot them to login
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This empty or loading fallback boundary satisfies useSearchParams() requirement!
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">Loading Profile Setup...</div>}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}

