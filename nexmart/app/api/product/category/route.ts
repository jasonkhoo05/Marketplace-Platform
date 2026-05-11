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

export async function POST(req: Request) {
    try{
        const supabase = await createClient();
        const body = await req.json();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const {
            prod_id,
            prod_cat_id,
        } = body;

        if (prod_id == null ||  prod_cat_id == null){
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400},
            );
        }

        const {data, error} = await supabase
        .from("prod_cat_link")
        .insert([
            {
            prod_id,
            prod_cat_id,
            }
        ]).select().single();

        if (error){
            return NextResponse.json(
                {error: error.message},
                {status: 500},
            );
        }

        return NextResponse.json({product: data}, {status: 201})
    }
    catch (err){
        return NextResponse.json(
            {error: "Server Error"},
            {status: 500},
        );
    }
}


