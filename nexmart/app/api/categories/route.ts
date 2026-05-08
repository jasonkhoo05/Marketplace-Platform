import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from("product_category_type")
            .select("*")
            .order("prod_cat_id");

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
