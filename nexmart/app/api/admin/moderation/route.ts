import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "15", 10);

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
      prod_status,
      prod_created_at,
      seller_uuid,
      user:seller_uuid ( username )
    `)
        .eq("prod_status", status)
        .order("prod_created_at", { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products = (data ?? []).map((product) => ({
        id: String(product.prod_id),
        type: "product",
        status: product.prod_status || "pending",
        created_at: product.prod_created_at || new Date().toISOString(),
        details: {
            title: product.prod_name,
            description: product.prod_desc || "No description",
            image: product.prod_image || null,
            seller: Array.isArray(product.user)
                ? product.user[0]?.username ?? "Unknown seller"
                : (product.user as any)?.username ?? "Unknown seller",
            price: product.prod_price,
            stock: product.prod_stock_qty,
        },
    }));

    return NextResponse.json(products);
}
