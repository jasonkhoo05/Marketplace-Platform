import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  // Exchange OAuth code for session
  await supabase.auth.exchangeCodeForSession(code);

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("user")
    .select("user_uuid")
    .eq("user_uuid", user.id)
    .maybeSingle();

  // Insert new Google user
  if (!existingUser) {
    const base =
      user.user_metadata.full_name
        ?.replace(/\s+/g, "_")
        .toLowerCase() ||
      user.email?.split("@")[0] ||
      "google_user";
    const username = `${base}_${user.id.slice(0, 6)}`;

    // Insert into user table
    const { error: userError } = await supabase.from("user").insert({
      user_uuid: user.id,
      username,
      email: user.email,
      phone: null,
      user_image: null,
      last_active_role: "buyer",
      is_new_user: true,
    });

    if (userError) {
      console.error("Insert user error:", userError.message);
    }

    // Insert buyer role into junction table
    const { error: roleError } = await supabase
      .from("user_role")
      .insert({
        user_uuid: user.id,
        role_id: 1, // buyer
      });

    if (roleError) {
      console.error("Insert role error:", roleError.message);
    }

    return NextResponse.redirect(`${origin}/profile?new=true`);
  }

  return NextResponse.redirect(`${origin}/products`);
}