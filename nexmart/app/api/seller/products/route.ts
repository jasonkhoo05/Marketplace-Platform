import { createClient } from "@/lib/supabase/server";
import { PARAM_SEPARATOR } from "next/dist/lib/route-pattern-normalizer";
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
          prod_cat_link!prod_cat_link_prod_fk(
          prod_cat_id,
          product_category_type!prod_cat_link_prod_cat_fk(
            prod_cat_name))
        `,
      )
      .eq("seller_uuid", user.id)
      .order("prod_id", { ascending: false })
      .limit(500); // TODO: Replace with pagination in next milestone

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

