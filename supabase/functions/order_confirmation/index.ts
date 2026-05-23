import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

type OrderLine = {
  name: string;
  quantity: number;
  lineTotal: number;
};

type RequestBody = {
  email?: string;
  username?: string;
  orderId?: string;
  buyerAddress?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  items?: OrderLine[];
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.email?.trim()) {
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_EDGE_FUNC_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      return new Response(
        JSON.stringify({ error: "Email secrets are not configured" }),
        { status: 503 },
      );
    }

    const username = body.username?.trim() || "Customer";
    const orderId = body.orderId ?? "N/A";
    const items = body.items ?? [];
    const subtotal = body.subtotal ?? 0;
    const tax = body.tax ?? 0;
    const total = body.total ?? subtotal + tax;
    const paymentLabel =
      body.paymentMethod === "google_pay"
        ? "Google Pay"
        : body.paymentMethod ?? "N/A";

    const itemRows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${item.lineTotal.toFixed(2)}</td>
          </tr>`,
      )
      .join("");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    await client.send({
      from: `NexMart <${gmailUser}>`,
      to: body.email.trim(),
      subject: `NexMart order confirmation ${orderId}`,
      html: `
        <h2>Hi ${username},</h2>
        <p>Thank you for your order on <strong>NexMart</strong>. Your payment was received.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Payment method:</strong> ${paymentLabel}</p>
        <p><strong>Shipping address:</strong> ${body.buyerAddress ?? "N/A"}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Item</th>
              <th style="text-align:center;padding:8px;border-bottom:2px solid #ddd;">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <p style="margin-top:16px;">Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Tax: $${tax.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p style="margin-top:24px;color:#666;font-size:12px;">NexMart Support</p>
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
