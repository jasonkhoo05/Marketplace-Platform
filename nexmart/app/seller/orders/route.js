import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("order")
        .select(`
            order_id,
            quantity,
            order_date,
            status,
            buyer:user_id (
                username,
                email,
                phone
            ),
            product:prod_id (
                prod_name
            )
        `)
        .order("order_date", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    const transformedOrders = data.map((order) => ({
        order_id: order.order_id,
        buyer_name: order.buyer?.username || "Unknown",
        buyer_email: order.buyer?.email || "N/A",
        buyer_phone: order.buyer?.phone || "N/A",
        product_name: order.product?.prod_name || "Unknown Product",
        quantity: order.quantity,
        order_date: order.order_date,
        status: order.status,
    }));

    return NextResponse.json(
        { orders: transformedOrders },
        { status: 200 }
    );
}