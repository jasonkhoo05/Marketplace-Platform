import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Get authenticated user (temporarily optional for testing)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Fetch products for the authenticated seller
        const { data, error } = await supabase
            .from("product")
            .select(`
                *,
                product_category_type!inner (
                    prod_cat_name
                )
            `)
            .eq("seller_uuid", user.id)
            .order("prod_id", { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ products: data });
    } catch (err) {
        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}
