import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("order")
        .select(

    )
        .order("order_date", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { status: 200 }
    );
}