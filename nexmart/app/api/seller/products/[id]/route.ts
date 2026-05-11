import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";



export async function DELETE(req: Request, { params } :{ params: { id: number }}) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
        );
    }

    const { error } = await supabase
      .from("product")
      .delete()
      .eq("prod_id", params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status : 500 });
      }
      return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}