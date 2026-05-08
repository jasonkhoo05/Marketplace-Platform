import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }>}) {
    try{
        const supabase = await createClient();
        const body = await req.json();
        const { id } = await params;

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const {
            prod_name,
            prod_desc,
            prod_price, 
            prod_stock_qty, 
            prod_cat_id,
            prod_image,
        } = body;
        
        if (!prod_name || prod_price == null ||  prod_stock_qty == null){
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400},
            );
        }

        // Check ownership
        const {data: existingProduct, error: fetchError} = await supabase
        .from("product")
        .select("*")
        .eq("prod_id", id)
        .single();

        if (!existingProduct || fetchError){
            return NextResponse.json(
                {error: "Product not found or unathorized"},
                {status: 401},
            );
        }

        const {data, error} = await supabase
        .from("product")
        .update(
            {
            prod_name,
            prod_desc,
            prod_price, 
            prod_stock_qty, 
            prod_cat_id,
            prod_image,
            }
        )
        .eq("prod_id", id)
        .select().single();

        if (error){
            return NextResponse.json(
                {error: error.message},
                {status: 500},
            );
        }

        return NextResponse.json({product: data}, {status: 202})
    } catch (err){
        return NextResponse.json(
            {error: "Server Error"},
            {status: 500},
        );
    }
}