import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const { username, email, phone, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "Username, email, and password are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: userError } = await supabase
    .from("user")
    .insert({
      user_uuid: authData.user.id,
      username,
      email,
      phone: phone || null,
      password,
      user_image: null,
      last_active_role: "buyer",
    });

  if (userError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  const { error: roleError } = await supabase.from("user_role").insert({
    user_uuid: authData.user.id,
    role_id: 1, // buyer
  });

  if (roleError) {
    console.error("Insert role error:", roleError.message);
    // Don't fail signup over role insert — user record exists
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
