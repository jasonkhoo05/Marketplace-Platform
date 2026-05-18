/**
 * To create product listing
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const supabase = await createClient();
        const body = await req.json();
        console.log("POST body", body)

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

        const {data: newProduct, error} = await supabase
        .from("product")
        .insert([
            {
            prod_name,
            prod_desc,
            prod_price,
            prod_stock_qty,
            // prod_cat_id,
            seller_uuid: user.id,
            prod_image,
            prod_rating: 0,
            prod_sold_qty: 0,

            // PRODUCT APPROVAL
            prod_status: "pending",
            prod_rejection_reason: "",
            },
        ]).select().single();


        if (error){
            return NextResponse.json(
                {error: error.message},
                {status: 500},
            );
        }


        const { error: prodCatError } = await supabase
            .from("prod_cat_link")
            .insert({
                prod_id: newProduct.prod_id,
                prod_cat_id: body.prod_cat_id
            });

        if (prodCatError) {
            return NextResponse.json(
                {error: prodCatError.message},
                {status: 500},
            );
        }

        return NextResponse.json({product: newProduct}, {status: 201})
    }
    catch (err){
        return NextResponse.json(
            {error: "Server Error"},
            {status: 500},
        );
    }
}