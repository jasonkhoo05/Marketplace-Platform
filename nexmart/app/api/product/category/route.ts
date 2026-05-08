import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("prod_cat_link")
            .select("*")
            .order("prod_id");

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ categories: data });
    } catch (err) {
        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}


