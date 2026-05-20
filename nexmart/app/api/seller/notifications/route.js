import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("notification")
        .select(`
            notification_id,
            seller_id,
            order_id,
            noti_title,
            noti_message,
            created_at,
            is_read
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { notifications: data || [] },
        { status: 200 }
    );
}