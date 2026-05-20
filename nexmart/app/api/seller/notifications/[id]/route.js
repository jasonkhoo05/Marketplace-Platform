import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function PATCH(request, { params }) {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("notification_id", params.id)
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
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("notification")
        .delete()
        .eq("notification_id", params.id);

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