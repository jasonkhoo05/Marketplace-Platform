import { NextRequest, NextResponse } from "next/server";
import { TAX_RATE } from "@/lib/checkout-db";
import {
  getSupabaseProjectUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/project-url";
import { createAdminClient } from "@/lib/supabaseServer";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import type {
  CheckoutRequestBody,
  CheckoutResponse,
  MockOrder,
  MockOrderItem,
  PaymentMethod,
} from "@/types/checkout";

const SUPPORTED_PAYMENT_METHODS: PaymentMethod[] = ["google_pay"];

type CartProductRow = {
  prod_id: number;
  prod_name: string;
  prod_price: number | string;
  prod_image: string;
  prod_stock_qty: number | string;
  prod_sold_qty?: number | string | null;
  prod_status: string;
  seller_uuid: string;
  user?: { username: string | null } | { username: string | null }[] | null;
};

type CartItemRow = {
  quantity: number | string;
  product: CartProductRow | CartProductRow[] | null;
};

type UserProfileRow = {
  username: string;
  email: string;
  phone: string | null;
  address?:
    | {
        address_id: number;
        address_line: string;
        city: string;
        postcode: string;
      }
    | {
        address_id: number;
        address_line: string;
        city: string;
        postcode: string;
      }[]
    | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumber(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

function createMockGooglePayTransactionId() {
  return `GPAY-${Date.now()}`;
}

async function simulateGooglePayPayment() {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    success: true,
    transactionId: createMockGooglePayTransactionId(),
  };
}

function formatAddressLine(
  addressLine: string,
  city: string,
  postcode: string,
) {
  return `${addressLine}, ${city}, ${postcode}`;
}

async function rollbackCheckout(
  admin: ReturnType<typeof createAdminClient>,
  createdOrderIds: number[],
  stockRollbacks: { prodId: number; quantity: number }[],
) {
  if (createdOrderIds.length) {
    await admin.from("order").delete().in("order_id", createdOrderIds);
  }

  for (const item of stockRollbacks) {
    const { data: product } = await admin
      .from("product")
      .select("prod_stock_qty, prod_sold_qty")
      .eq("prod_id", item.prodId)
      .maybeSingle();

    if (!product) continue;

    const stock = toNumber(product.prod_stock_qty);
    const sold = toNumber(product.prod_sold_qty ?? 0);

    await admin
      .from("product")
      .update({
        prod_stock_qty: stock + item.quantity,
        prod_sold_qty: Math.max(0, sold - item.quantity),
      })
      .eq("prod_id", item.prodId);
  }
}

async function invokeOrderConfirmationEmail(payload: {
  email: string;
  username: string;
  orderId: string;
  buyerAddress: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  items: MockOrderItem[];
}): Promise<{ sent: boolean; error?: string }> {
  const projectUrl = getSupabaseProjectUrl();
  const serviceKey = getSupabaseServiceRoleKey();

  if (!projectUrl) {
    return { sent: false, error: "NEXT_PUBLIC_SUPABASE_URL is not set." };
  }

  if (!serviceKey) {
    return {
      sent: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.",
    };
  }

  const functionUrl = `${projectUrl}/functions/v1/order_confirmation`;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email: payload.email,
        username: payload.username,
        orderId: payload.orderId,
        buyerAddress: payload.buyerAddress,
        subtotal: payload.subtotal,
        tax: payload.tax,
        total: payload.total,
        paymentMethod: payload.paymentMethod,
        items: payload.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      }),
    });

    if (response.ok) {
      return { sent: true };
    }

    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string; message?: string };
      detail = body.error ?? body.message ?? detail;
    } catch {
      // ignore JSON parse errors
    }

    if (response.status === 404) {
      detail = `${detail} — deploy the function: supabase functions deploy order_confirmation`;
    }

    console.error("[checkout] order_confirmation failed:", detail);
    return { sent: false, error: detail };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to call order_confirmation.";
    console.error("[checkout] order_confirmation request error:", message);
    return { sent: false, error: message };
  }
}

export async function POST(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Supabase is not configured (missing environment variables)" },
      { status: 503 },
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is missing in .env.local" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  try {
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

    const body = (await request.json()) as Partial<CheckoutRequestBody>;
    const paymentMethod = body.paymentMethod;

    if (
      typeof paymentMethod !== "string" ||
      !SUPPORTED_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)
    ) {
      return NextResponse.json(
        { error: "Google Pay is currently the only supported payment method." },
        { status: 400 },
      );
    }

    const { data: profile, error: profileError } = await admin
      .from("user")
      .select(
        `
        username,
        email,
        phone,
        address!address_user_uuid_fkey (
          address_id,
          address_line,
          city,
          postcode
        )
      `,
      )
      .eq("user_uuid", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error:
            "Please complete your profile and delivery address before checkout.",
        },
        { status: 400 },
      );
    }

    const profileRow = profile as UserProfileRow;
    const addressData = profileRow.address;
    const addressRow = Array.isArray(addressData)
      ? addressData[0]
      : addressData;

    if (
      !isNonEmptyString(profileRow.username) ||
      !isNonEmptyString(profileRow.email) ||
      !isNonEmptyString(profileRow.phone) ||
      !addressRow?.address_line?.trim() ||
      !addressRow?.city?.trim() ||
      !addressRow?.postcode?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete your shipping information on your profile before placing the order.",
        },
        { status: 400 },
      );
    }

    const { data: cartRows, error: cartError } = await admin
      .from("cart_item")
      .select(
        `
        quantity,
        product:prod_id (
          prod_id,
          prod_name,
          prod_price,
          prod_image,
          prod_stock_qty,
          prod_sold_qty,
          prod_status,
          seller_uuid,
          user!product_seller_uuid_fkey (username)
        )
      `,
      )
      .eq("user_uuid", user.id);

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    if (!cartRows?.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const checkoutLines: Array<{
      product: CartProductRow;
      quantity: number;
      sellerName: string;
    }> = [];

    for (const row of cartRows as CartItemRow[]) {
      const product = Array.isArray(row.product) ? row.product[0] : row.product;
      if (!product) continue;

      const quantity = toNumber(row.quantity);
      const stock = toNumber(product.prod_stock_qty);

      if (product.prod_status !== "approved") {
        return NextResponse.json(
          { error: `${product.prod_name} is not available for purchase.` },
          { status: 400 },
        );
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for ${product.prod_name}.` },
          { status: 400 },
        );
      }

      if (quantity > stock) {
        return NextResponse.json(
          {
            error: `Only ${stock} unit(s) of ${product.prod_name} are available.`,
          },
          { status: 400 },
        );
      }

      const seller = Array.isArray(product.user) ? product.user[0] : product.user;

      checkoutLines.push({
        product,
        quantity,
        sellerName: seller?.username ?? "Seller",
      });
    }

    if (!checkoutLines.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const paymentResult = await simulateGooglePayPayment();

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: "Google Pay payment failed. No order was created." },
        { status: 402 },
      );
    }

    const paymentTransactionId = paymentResult.transactionId;
    const orderDate = new Date().toISOString();
    const createdOrderIds: number[] = [];
    const stockRollbacks: { prodId: number; quantity: number }[] = [];
    const buyerAddressText = formatAddressLine(
      addressRow.address_line,
      addressRow.city,
      addressRow.postcode,
    );

    for (const line of checkoutLines) {
      const lineTotal = Number(
        (line.quantity * toNumber(line.product.prod_price)).toFixed(2),
      );

      const { data: insertedOrder, error: orderError } = await admin
        .from("order")
        .insert({
          order_date: orderDate,
          order_status: "Pending",
          order_quantity: line.quantity,
          order_price: lineTotal,
          order_buyer_address: addressRow.address_id,
          seller_id: line.product.seller_uuid,
          buyer_id: user.id,
          prod_id: line.product.prod_id,
          payment_method: paymentMethod,
          payment_transaction_id: paymentTransactionId,
          payment_status: "Paid",
        })
        .select("order_id")
        .single();

      if (orderError || !insertedOrder) {
        await rollbackCheckout(admin, createdOrderIds, stockRollbacks);
        return NextResponse.json(
          { error: orderError?.message ?? "Failed to create order." },
          { status: 500 },
        );
      }

      createdOrderIds.push(insertedOrder.order_id);

      const stock = toNumber(line.product.prod_stock_qty);
      const sold = toNumber(line.product.prod_sold_qty ?? 0);

      const { error: stockError } = await admin
        .from("product")
        .update({
          prod_stock_qty: stock - line.quantity,
          prod_sold_qty: sold + line.quantity,
        })
        .eq("prod_id", line.product.prod_id);

      if (stockError) {
        await rollbackCheckout(admin, createdOrderIds, stockRollbacks);
        return NextResponse.json({ error: stockError.message }, { status: 500 });
      }

      stockRollbacks.push({
        prodId: line.product.prod_id,
        quantity: line.quantity,
      });

      const { error: notificationError } = await admin.from("notification").insert({
        seller_id: line.product.seller_uuid,
        order_id: insertedOrder.order_id,
        noti_title: "New order",
        noti_message: `New order from ${profileRow.username} for ${line.product.prod_name} (qty ${line.quantity}).`,
        is_read: false,
      });

      if (notificationError) {
        await rollbackCheckout(admin, createdOrderIds, stockRollbacks);
        return NextResponse.json(
          { error: notificationError.message },
          { status: 500 },
        );
      }
    }

    const { error: clearCartError } = await admin
      .from("cart_item")
      .delete()
      .eq("user_uuid", user.id);

    if (clearCartError) {
      console.error("[checkout] failed to clear cart:", clearCartError.message);
    }

    const orderItems: MockOrderItem[] = checkoutLines.map((line) => ({
      productId: line.product.prod_id,
      name: line.product.prod_name,
      price: toNumber(line.product.prod_price),
      image: line.product.prod_image,
      seller: line.sellerName,
      quantity: line.quantity,
      lineTotal: Number(
        (line.quantity * toNumber(line.product.prod_price)).toFixed(2),
      ),
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const totalPrice = Number((subtotal + tax).toFixed(2));
    const displayOrderId = `ORD-${paymentTransactionId.replace(/^GPAY-/, "")}`;

    const emailResult = await invokeOrderConfirmationEmail({
      email: profileRow.email,
      username: profileRow.username,
      orderId: displayOrderId,
      buyerAddress: buyerAddressText,
      subtotal,
      tax,
      total: totalPrice,
      paymentMethod,
      items: orderItems,
    });

    const order: MockOrder = {
      id: displayOrderId,
      groupKey: paymentTransactionId,
      buyerName: profileRow.username,
      buyerEmail: profileRow.email,
      buyerAddress: buyerAddressText,
      productName: orderItems.map((item) => item.name).join(", "),
      productImage: orderItems[0]?.image ?? "",
      quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      totalPrice,
      orderDate,
      status: "Pending",
      paymentMethod,
      paymentStatus: "Paid",
      paymentTransactionId,
      items: orderItems,
      confirmationEmailSent: emailResult.sent,
      sellerNotificationSent: true,
      stockUpdateSimulated: false,
      orderIds: createdOrderIds,
    };

    const response: CheckoutResponse = {
      message: "Order placed successfully.",
      order,
      emailMessage: emailResult.sent
        ? `Confirmation email sent to ${profileRow.email}.`
        : `Order saved, but confirmation email could not be sent to ${profileRow.email}.${emailResult.error ? ` Reason: ${emailResult.error}` : ""}`,
      sellerNotificationMessage: "Sellers were notified about this order.",
      stockUpdateMessage: "Product stock was updated.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Checkout failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
