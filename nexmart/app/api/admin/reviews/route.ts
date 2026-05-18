import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    try{
        const supabase = await createClient();

        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get("limit") || 10);

        const {data, error} = await supabase
            .from("product_review")
            .select("*")
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