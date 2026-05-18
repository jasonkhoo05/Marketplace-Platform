/**
 * To update the product listing
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id } = await params;
    const prodId = Number(id);

    if (Number.isNaN(prodId)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 },
      );
    }

    // Get authenticated user
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

    const {
      prod_name,
      prod_desc,
      prod_price,
      prod_stock_qty,
      prod_cat_id,
      prod_image,
    } = body;

    if (!prod_name || prod_price == null || prod_stock_qty == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check product exists, belongs to seller, and is not hidden
    const { data: existingProduct, error: fetchError } = await supabase
      .from("product")
      .select("prod_id, seller_uuid, prod_status")
      .eq("prod_id", prodId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    if (existingProduct.seller_uuid !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    if (existingProduct.prod_status === "hidden") {
      return NextResponse.json(
        { error: "Invalid action: rejected listings cannot be edited." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("product")
      .update({
        prod_name,
        prod_desc,
        prod_price,
        prod_stock_qty,
        prod_image,
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

    // Update category only after validation passes
    await supabase.from("prod_cat_link").delete().eq("prod_id", prodId);

    const { error: catError } = await supabase.from("prod_cat_link").insert({
      prod_id: prodId,
      prod_cat_id,
    });

    if (catError) {
      return NextResponse.json(
        { error: catError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ product: data }, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 },
    );
  }
}