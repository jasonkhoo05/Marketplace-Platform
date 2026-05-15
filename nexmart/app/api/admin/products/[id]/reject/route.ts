import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ProductStatus = "approved" | "hidden";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const prodId = Number(id);

    if (Number.isNaN(prodId)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const prodStatus = body.prod_status as ProductStatus;
    const rejectionReason =
      typeof body.prod_rejection_reason === "string"
        ? body.prod_rejection_reason
        : "";

    if (prodStatus !== "approved" && prodStatus !== "hidden") {
      return NextResponse.json(
        { error: "Invalid product status" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("product")
      .update({
        prod_status: prodStatus,
        prod_rejection_reason:
          prodStatus === "hidden" ? rejectionReason : "",
      })
      .eq("prod_id", prodId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ product: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 },
    );
  }
}