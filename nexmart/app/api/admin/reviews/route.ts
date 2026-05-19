import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    try{
        const supabase = await createClient();

        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get("limit") || 5);

        const { data, error } = await supabase
        .from("product_review")
        .select(`
            prod_id,
            user_uuid,
            review,
            flag,
            product:product (
            prod_name,
            prod_image
            ),
            user:user (
            username
            )
        `)
        .eq("flag", "f")
        .order("prod_id", { ascending: false })
        .limit(limit);

        if (error){
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json(data ?? []);
    } catch (err){
        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}