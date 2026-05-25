import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabaseServer";

function mapOrderRow(order) {
  const buyer = Array.isArray(order.user) ? order.user[0] : order.user;
  const product = Array.isArray(order.product) ? order.product[0] : order.product;

  return {
    order_id: order.order_id,
    buyer_name: buyer?.username ?? "Unknown buyer",
    buyer_email: buyer?.email ?? "N/A",
    buyer_phone: buyer?.phone ?? "N/A",
    product_name: product?.prod_name ?? "Unknown product",
    product_image: product?.prod_image ?? "/placeholder.jpg",
    quantity: order.order_quantity,
    total_price: order.order_price,
    order_date: order.order_date,
    status: order.order_status,
    buyer_address: order.order_buyer_address,
  };
}

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

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    const { data, error } = await db
      .from("order")
      .select(
        `
        order_id,
        order_quantity,
        order_date,
        order_status,
        order_price,
        order_buyer_address,
        user!order_buyer_id_fkey (
          username,
          email,
          phone
        ),
        product!order_prod_id_fkey (
          prod_name,
          prod_image
        )
      `,
      )
      .eq("seller_id", user.id)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("[seller/orders] query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = (data ?? []).map(mapOrderRow);
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.total_price ?? 0),
      0,
    );

    return NextResponse.json(
      {
        orders,
        totalOrders: orders.length,
        revenue,
        recentOrders: orders.slice(0, 5),
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
