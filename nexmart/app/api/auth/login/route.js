import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }

  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("user_id, username, email, last_active_role")
    .eq("user_uuid", data.user.id)
    .maybeSingle();

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: userData,
    },
    { status: 200 }
  );
}