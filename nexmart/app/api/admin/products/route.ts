import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("product")
    .select(`
      prod_id,
      prod_name,
      prod_desc,
      prod_price,
      prod_stock_qty,
      prod_image,
      prod_created_at,
      seller_uuid,
      user:seller_uuid ( username )
    `)
    .eq("prod_status", "pending")
    .order("prod_created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
