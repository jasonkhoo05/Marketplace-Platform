import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("order")
        .select(
            
            `
            order_id,
                order_quantity,
                order_date,
                order_status,
                order_price,
                order_buyer_address,

                buyer:user_uuid (
                    username,
                    email,
                    phone
                ),

                product:prod_id (
                    prod_name,
                    prod_image
                )
        `
        
    )
        .order("order_date", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    const transformedOrders = data.map((order) => ({
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

            buyer_address: order.order_buyer_address,
    }));

    return NextResponse.json(
        { orders: transformedOrders },
        { status: 200 }
    );
    
}