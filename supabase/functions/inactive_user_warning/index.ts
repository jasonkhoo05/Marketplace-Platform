import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const sevenDaysAgo = new Date();
  // sevenDaysAgo.setMinutes(sevenDaysAgo.getMinutes() - 10);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 500 });
  }

  const inactiveUsers = users.filter((u) => {
    if (!u.last_sign_in_at) return false;
    return new Date(u.last_sign_in_at) < sevenDaysAgo;
  });

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: Deno.env.get("GMAIL_USER")!,
        password: Deno.env.get("GMAIL_EDGE_FUNC_PASSWORD")!,
      },
    },
  });

  for (const user of inactiveUsers) {
    const { data: userData } = await supabase
      .from("user")
      .select("username")
      .eq("user_uuid", user.id)
      .single();

    const username = userData?.username ?? "User";

    await client.send({
      from: `NexMart Support <${Deno.env.get("GMAIL_USER")!}>`,
      to: user.email!,
      subject: "Your NexMart account will be deactivated",
      html: `
        <h2>Hi ${username},</h2>
        <p>We noticed you haven't logged into your <strong>NexMart</strong> account for over 7 days.</p>
        <p>Please log in soon to keep your account active, otherwise it may be deactivated.</p>
        <br/>
        <p>NexMart Support</p>
      `,
    });
  }

  await client.close();

  return new Response(
    JSON.stringify({ message: `Warned ${inactiveUsers.length} inactive users.` }),
    { status: 200 }
  );
});