import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = ["buyer", "seller"] as const;
type ActiveRole = (typeof ALLOWED_ROLES)[number];

function isActiveRole(value: unknown): value is ActiveRole {
  return (
    typeof value === "string" &&
    ALLOWED_ROLES.includes(value as ActiveRole)
  );
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const role = body.last_active_role ?? body.role;

    if (!isActiveRole(role)) {
      return NextResponse.json(
        { error: "last_active_role must be buyer or seller" },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("user")
      .update({ last_active_role: role })
      .eq("user_uuid", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, last_active_role: role });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
