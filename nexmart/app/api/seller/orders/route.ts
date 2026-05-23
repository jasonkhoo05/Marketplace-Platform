// app/api/seller/orders/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

// ==========================================
// 1. GET HANDLER (Fetch all orders)
// ==========================================
export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("order")
        .select(`
            order_id,
            order_quantity,
            order_date,
            order_status,
            order_price,
            order_buyer_address,
            buyer_id,
            buyer:buyer_id (
                username,
                email,
                phone
            ),
            product:prod_id (
                prod_name,
                prod_image
            ),
            address:order_buyer_address (
                address_line,
                city,
                postcode
            )
        `)
        .order("order_date", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    const transformedOrders = data.map((order: any) => ({
        order_id: order.order_id,
        buyer_name: order.buyer?.username || "Unknown buyer",
        buyer_email: order.buyer?.email || "N/A",
        buyer_phone: order.buyer?.phone || "N/A",
        product_name: order.product?.prod_name || "Unknown product",
        product_image: order.product?.prod_image || "/placeholder.jpg",
        quantity: order.order_quantity,
        total_price: order.order_price,
        order_date: order.order_date,
        status: order.order_status,
        buyer_address: order.address 
            ? `${order.address.address_line}, ${order.address.city} ${order.address.postcode}`.trim()
            : "No address provided",
    })); 

    return NextResponse.json(
        { orders: transformedOrders },
        { status: 200 }
    );
}

// ==========================================
// 2. PATCH HANDLER (Update an order status)
// ==========================================
export async function PATCH(request: Request) {
    try {
        const { orderId, status } = await request.json();

        console.log("Incoming Order ID:", orderId);
        console.log("Incoming status:", status);

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("order")
            .update({
                order_status: status,
            })
            .eq("order_id", Number(orderId))
            .select()
            .single();

        if (error) {
            console.error("SUPABASE ERROR:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.log("UPDATED:", data);
        return NextResponse.json({ order: data }, { status: 200 });

    } catch (error: any) {
        console.error("PATCH ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}