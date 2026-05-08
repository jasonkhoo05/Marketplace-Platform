import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("product")
      .select(
        `
          *,
          product_category_type!inner (
            prod_cat_name
          )
        `,
      )
      .eq("seller_uuid", user.id)
      .order("prod_id", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
