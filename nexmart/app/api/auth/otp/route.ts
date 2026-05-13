import { NextResponse} from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const {
        email = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required"},
                { status: 400 }
            )
        }
    };

}
