import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const admin = createAdminClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
        );
    }

    const { data, error } = await admin
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
        .eq("seller_id", user.id)
        .order("notification_id", { ascending: false });

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