import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const { data: currentUser, error: userError } =
      await supabase
        .from("users")
        .select("user_id, last_active_role")
        .eq("user_uuid", user.id)
        .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (currentUser.last_active_role !== "seller") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const { data: products, error: productError } =
      await supabase.from("products").select(`
          prod_id,
          prod_name,
          prod_price,
          prod_stock_qty,
          prod_cat_id,
          prod_image
        `)
        .eq("seller_id", currentUser.user_id)

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      )
    }

    const formattedProducts = products.map(product => ({
      prod_id: p.prod_id, // for delete action
      product: p.prod_name,
      category: p.prod_cat_type?.prod_cat_name || "Unknown",
      price: p.prod_price,
      stock: p.prod_stock_qty,
      sales: p.prod_sold_qty,

      buyer_status:
        p.prod_stock_qty === 0
          ? "Out of Stock"
          : "Available"
    }))

    return NextResponse.json(formattedProducts)

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}