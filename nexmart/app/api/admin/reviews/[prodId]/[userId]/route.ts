import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";

export async function PATCH
(
    req: Request, 
    { params }: { params: Promise<{ prodId: string, userId: string }> }
)
{
    try {
        const authSupabase = await createClient();
        const { data: { user },
                error: authError,} = await authSupabase.auth.getUser();
        
        if (!user || authError) {
            return NextResponse.json(
                { error: "Authentication required" },
                {status: 401}
            )
        }
        const admin = await isAdmin(user.id);

        if (!admin){
            return NextResponse.json(
                { error: "Unauthorized required" },
                {status: 404}
            )   
        }

        const {prodId, userId} = await params;

        const body = await req.json();
        const flag = body.flag;
        if (!['y', 'n'].includes(flag)){
            return NextResponse.json(
                { error: "Invalid flag" },
                {status: 400}
            )   
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
        .from("product_review")
        .update({
            flag
        })
        .eq("prod_id", Number(prodId))
        .eq("user_uuid", userId)
        .select()
        .maybeSingle();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 },
            );
        }

        if (!data){
            return NextResponse.json(
                { error: "Review not found" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {message: flag == 'y'? "Review approved for deletion": "Review reject", review: data},
            {status: 200}

        );

    } catch (err){
        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}
