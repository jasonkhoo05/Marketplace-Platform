import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
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
        .update({ is_read: true })
        .eq("notification_id", params.id)
        .eq("seller_id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { notification: data },
        { status: 200 }
    );
}

export async function DELETE(request, { params }) {
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

    const { error } = await admin
        .from("notification")
        .delete()
        .eq("notification_id", params.id)
        .eq("seller_id", user.id);

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );
}