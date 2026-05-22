import { NextRequest, NextResponse } from "next/server";
import {
  buildCartResponse,
  CART_ITEM_SELECT,
  mapCartRows,
  type CartItemRow,
} from "@/lib/cart";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

type CartProductInput = {
  id: number;
};

type AddToCartRequestBody = {
  product?: Partial<CartProductInput>;
  quantity?: number;
};

type UpdateCartRequestBody = {
  productId?: number;
  quantity?: number;
};

function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}

function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

async function fetchUserCartItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userUuid: string,
) {
  const { data, error } = await supabase
    .from("cart_item")
    .select(CART_ITEM_SELECT)
    .eq("user_uuid", userUuid)
    .order("cart_item_id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mapCartRows(data as CartItemRow[] | null);
}

async function fetchApprovedProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  prodId: number,
) {
  const { data, error } = await supabase
    .from("product")
    .select("prod_id, prod_stock_qty, prod_status")
    .eq("prod_id", prodId)
    .eq("prod_status", "approved")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function stockQuantity(product: { prod_stock_qty: number | string }): number {
  return typeof product.prod_stock_qty === "string"
    ? Number(product.prod_stock_qty)
    : product.prod_stock_qty;
}

export async function GET() {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const items = await fetchUserCartItems(supabase, user.id);
    return NextResponse.json(buildCartResponse(items));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load cart.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as AddToCartRequestBody;
    const { product, quantity } = body;

    if (!product || !isPositiveWholeNumber(product.id)) {
      return NextResponse.json(
        { error: "Invalid product details." },
        { status: 400 },
      );
    }

    if (!isPositiveWholeNumber(quantity)) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 },
      );
    }

    const approvedProduct = await fetchApprovedProduct(supabase, product.id);

    if (!approvedProduct) {
      return NextResponse.json(
        { error: "This product is not available." },
        { status: 400 },
      );
    }

    const availableStock = stockQuantity(approvedProduct);

    if (availableStock <= 0) {
      return NextResponse.json(
        { error: "This product is out of stock." },
        { status: 400 },
      );
    }

    const { data: existingRow, error: existingError } = await supabase
      .from("cart_item")
      .select("quantity")
      .eq("user_uuid", user.id)
      .eq("prod_id", product.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingQuantity = existingRow
      ? typeof existingRow.quantity === "string"
        ? Number(existingRow.quantity)
        : existingRow.quantity
      : 0;

    const nextQuantity = Math.min(
      (existingRow ? existingQuantity : 0) + quantity,
      availableStock,
    );

    if (existingRow) {
      const { error: updateError } = await supabase
        .from("cart_item")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("user_uuid", user.id)
        .eq("prod_id", product.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabase.from("cart_item").insert({
        user_uuid: user.id,
        prod_id: product.id,
        quantity: Math.min(quantity, availableStock),
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const items = await fetchUserCartItems(supabase, user.id);

    return NextResponse.json(
      {
        message: "Product added to cart.",
        ...buildCartResponse(items),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add product to cart.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as UpdateCartRequestBody;
    const { productId, quantity } = body;

    if (!isPositiveWholeNumber(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 },
      );
    }

    if (!isPositiveWholeNumber(quantity)) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 },
      );
    }

    const approvedProduct = await fetchApprovedProduct(supabase, productId);

    if (!approvedProduct) {
      return NextResponse.json(
        { error: "This product is not available." },
        { status: 400 },
      );
    }

    const availableStock = stockQuantity(approvedProduct);
    const nextQuantity = Math.min(quantity, availableStock);

    const { data: updatedRows, error: updateError } = await supabase
      .from("cart_item")
      .update({
        quantity: nextQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("user_uuid", user.id)
      .eq("prod_id", productId)
      .select("cart_item_id");

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!updatedRows?.length) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 },
      );
    }

    const items = await fetchUserCartItems(supabase, user.id);

    return NextResponse.json({
      message: "Cart item updated.",
      ...buildCartResponse(items),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart item.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const productIdParam = request.nextUrl.searchParams.get("productId");

    if (!productIdParam) {
      const { error } = await supabase
        .from("cart_item")
        .delete()
        .eq("user_uuid", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        message: "Cart cleared.",
        ...buildCartResponse([]),
      });
    }

    const productId = Number(productIdParam);

    if (!isPositiveWholeNumber(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 },
      );
    }

    const { data: deletedRows, error } = await supabase
      .from("cart_item")
      .delete()
      .eq("user_uuid", user.id)
      .eq("prod_id", productId)
      .select("cart_item_id");

    if (error) {
      throw new Error(error.message);
    }

    if (!deletedRows?.length) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 },
      );
    }

    const items = await fetchUserCartItems(supabase, user.id);

    return NextResponse.json({
      message: "Cart item removed.",
      ...buildCartResponse(items),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
