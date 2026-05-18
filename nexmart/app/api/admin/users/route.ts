import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error, count } = await supabase
    .from("user")
    .select(
      `
      user_uuid,
      username,
      email,
      phone,
      last_active_role,
      user_image,
      gender,
      date_of_birth,
      address!address_user_uuid_fkey(
        address_line,
        city,
        postcode,
        is_default
      ),
      user_role(
        role(
          role_name
        )
      )
    `,
      { count: "exact" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = data ?? [];

  const limitedUsers = users.slice(0, limit);

  return NextResponse.json({
    users: limitedUsers,
    totalCount: count || 0,
  });
}