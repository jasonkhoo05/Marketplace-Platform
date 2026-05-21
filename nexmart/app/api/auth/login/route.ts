import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[login] signInWithPassword error:", error.message, error.status);
    const { data: existingUser } = await supabase
      .from("user")
      .select("user_uuid")
      .eq("email", email)
      .maybeSingle();

    if (!existingUser) {
      return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
    }

    return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("user_uuid, username, email, last_active_role, is_new_user")
    .eq("user_uuid", data.user.id)
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  if (!userData) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Account not found. Please sign up first." }, { status: 404 });
  }

  // DETERMINISTIC ROUTING LOGIC
  let redirectTo = "/products"; // Default destination for existing users

  if (userData.is_new_user) {
  // First time logging in? Force them to the profile onboarding page
    redirectTo = "/profile?new=true";
  } 

  return NextResponse.json({ success: true, user: userData, redirectTo }, { status: 200 });
}
