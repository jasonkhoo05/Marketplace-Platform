import { NextRequest, NextResponse } from "next/server";
import {
  type DbOrderRow,
  groupOrderRowsToMockOrders,
} from "@/lib/checkout-db";
import { createAdminClient } from "@/lib/supabaseServer";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export async function GET() {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user")
    .select("username, email")
    .eq("user_uuid", user.id)
    .maybeSingle();

  const { data: rows, error } = await admin
    .from("order")
    .select(
      `
      order_id,
      order_date,
      order_status,
      order_quantity,
      order_price,
      order_buyer_address,
      seller_id,
      buyer_id,
      prod_id,
      payment_method,
      payment_transaction_id,
      payment_status,
      product:prod_id (prod_name, prod_image),
      address:order_buyer_address (address_line, city, postcode)
    `,
    )
    .eq("buyer_id", user.id)
    .order("order_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = groupOrderRowsToMockOrders(
    (rows ?? []) as DbOrderRow[],
    profile?.username ?? "Buyer",
    profile?.email ?? user.email ?? "",
  );

  return NextResponse.json({ orders });
}

export async function DELETE(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  const groupKey = request.nextUrl.searchParams.get("groupKey");

  if (!orderId && !groupKey) {
    return NextResponse.json(
      { error: "orderId or groupKey is required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  let query = admin
    .from("order")
    .update({ order_status: "Cancelled" })
    .eq("buyer_id", user.id);

  if (groupKey) {
    query = query.eq("payment_transaction_id", groupKey);
  } else if (orderId?.startsWith("ORD-")) {
    const suffix = orderId.replace(/^ORD-/, "");
    if (suffix.startsWith("GPAY-")) {
      query = query.eq("payment_transaction_id", suffix);
    } else {
      const numericId = Number(suffix);
      if (!Number.isNaN(numericId)) {
        query = query.eq("order_id", numericId);
      } else {
        query = query.eq("payment_transaction_id", suffix);
      }
    }
  }

  const { data, error } = await query.select("order_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Order cancelled.",
    cancelledCount: data.length,
  });
}
