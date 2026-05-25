import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function PATCH(request:Request, { params }: { params: { orderId: string } }) {
    const { status } = await request.json();

    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("order")
        .update({ order_status: status })
        .eq("order_id", params.orderId)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { order: data },
        { status: 200 }
    );
}