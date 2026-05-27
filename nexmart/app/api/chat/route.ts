
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";


export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Authenticate user session details
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Inspect if a query parameter for a single conversation's messages was passed
    const { searchParams } = new URL(request.url);
    const chatIdParam = searchParams.get("chatId");

    if (chatIdParam) {
      // Pull history timeline log rows matching the passed parameter
      const { data: messages, error: msgError } = await supabase
        .from("chat_message")
        .select("*")
        .eq("chat_id", parseInt(chatIdParam))
        .order("created_at", { ascending: true });

      if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });
      return NextResponse.json(messages);
    }

    // 1. FIXED: Removed '!inner' so buyers can see empty, newly-created chats
    const { data: chats, error: dbError } = await supabase
      .from("chat")
      .select(`
        *,
        chat_message(message_id, message, created_at)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    let finalChats = chats || [];

    // 2. FIXED: Filter logically. Buyers see empty chats; sellers only see chats with >= 1 message
    finalChats = finalChats.filter((chat) => {
      const isBuyer = chat.buyer_id === user.id;
      const hasMessages = chat.chat_message && chat.chat_message.length > 0;
      
      if (isBuyer) return true; 
      return hasMessages;       
    });

    // Format fields seamlessly into layout variables
    const formatted = finalChats.map((chat) => {
      const isBuyer = chat.buyer_id === user.id;
      
      // 3. FIXED: Changed chat.messages to chat.chat_message to match the table join key
      const hasMessages = chat.chat_message && chat.chat_message.length > 0;
      const lastMsgObj = hasMessages ? chat.chat_message[chat.chat_message.length - 1] : null;

      return {
        chat_id: chat.chat_id,
        buyer_id: chat.buyer_id,
        seller_id: chat.seller_id,
        prod_id: chat.prod_id,
        id: chat.chat_id.toString(),
        other_user_name: isBuyer 
          ? `Seller (${chat.seller_id.slice(0, 5)})` 
          : `Buyer (${chat.buyer_id.slice(0, 5)})`,
        product_name: `Product Item #${chat.prod_id}`,
        last_message: lastMsgObj ? lastMsgObj.message : "No messages yet",
        last_message_at: lastMsgObj ? lastMsgObj.created_at : chat.created_at,
        unread_count: 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { 
      data: { user }, 
      error: authError 
      } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const body = await request.json();
    const body = await req.json();
    const { chatId, message, sellerId, productId } = body;

    

    // =========================================================================
    // SCENARIO A: AI Chat via Groq (greeting or buyer message)
    // =========================================================================
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (body.isGreet || body.ai_reply_to_save || (body.message && !chatId && !sellerId)) {
      const { isGreet, prod_name, prod_price, prod_desc, prod_stock, history, ai_reply_to_save, chat_id: aiChatId } = body;
      if (ai_reply_to_save && aiChatId) {
        await supabase.from("chat_message").insert([{
          chat_id: aiChatId,
          sender_id: user.id,
          message: ai_reply_to_save,
          read: false,
          is_ai: true,
        }]);
        return NextResponse.json({ ok: true });
      }

      const stockStatus = prod_stock !== undefined && prod_stock !== null
        ? (Number(prod_stock) > 0 ? `In stock (${prod_stock} units available)` : "Out of stock — do NOT tell the buyer this item is available")
        : "Stock status unknown";

      const systemPrompt = `You are a warm, polite, and professional seller assistant for a Malaysian e-commerce platform.
      You are selling: ${prod_name ?? "a product"}, priced at ${prod_price ?? "an unspecified price"}.
      Product description: ${prod_desc ?? "No description provided."}
      Stock availability: ${stockStatus}.
      IMPORTANT: If the buyer asks about stock or availability, you MUST use the stock availability stated above. Never assume or guess.
      IMPORTANT: Always reply in English only, regardless of what language the buyer uses.
      Always be extremely polite, friendly, and patient, no matter how many times the buyer asks the same question.
      Shipping and delivery context is within Malaysia (e.g. Pos Laju, J&T, DHL eCommerce Malaysia).
      Never show frustration. Always end your reply with a warm closing or offer to help further.
      Answer questions about the product only. Keep replies concise and friendly.`;

      const userMessage = isGreet
        ? `Greet the buyer warmly and briefly introduce the product in 1-2 sentences. You MUST reply in English only.`
        : message;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...(history && !isGreet ? history : []),
          { role: "user", content: userMessage },
        ],
        max_tokens: 200,
      });

      const reply = completion.choices[0]?.message?.content ?? "Hi! How can I help you?";
      return NextResponse.json({ reply });
    }

    // =========================================================================
    // SCENARIO B: Clicking "Chat with Seller" from a Product Page (Create Chat Room)
    // =========================================================================
    if (sellerId && productId && !chatId) {
      // 1. Check if a chat room already exists between this buyer, seller, and product
      const { data: existingChat } = await supabase
        .from("chat")
        .select("*")
        .eq("buyer_id", user.id)
        .eq("seller_id", sellerId)
        .eq("prod_id", productId)
        .maybeSingle();

      if (existingChat) {
        return NextResponse.json(existingChat);
      }

      // 2. If it doesn't exist, create a brand new chat room row!
      const { data: newChat, error: chatError } = await supabase
        .from("chat")
        .insert([
          {
            buyer_id: user.id,
            seller_id: sellerId,
            prod_id: productId,
          },
        ])
        .select()
        .single();

      if (chatError) {
        return NextResponse.json({ error: chatError.message }, { status: 500 });
      }

      return NextResponse.json(newChat);
    }

    // =========================================================================
    // SCENARIO C: Typing a message inside an open chat box (Send Message)
    // =========================================================================
    if (chatId && message) {
      const payload = {
        chat_id: chatId,
        sender_id: user.id,
        message: message,
        read: false,
        is_ai: false,
      };

      const { data: newMessage, error: dbError } = await supabase
        .from("chat_message")
        .insert([payload])
        .select()
        .single();

      if (dbError) {
        return NextResponse.json(
          { error: dbError.message }, 
          { status: 500 });
      }

      return NextResponse.json(newMessage);
    }

    return NextResponse.json({ error: "Invalid request payload parameters." }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

  // // database chat
  // const supabase = await createClient();
  
  // const { data: { user }, error: authError } = await supabase.auth.getUser();

  // if (authError || !user) {
  //   return NextResponse.json({ 
  //     error: "Unauthorized" }, 
  //     { status: 401 }
  //     );
  //   }

  //   // const body = await request.json();
  //   const { chatId, message, sellerId, productId } = body;

  //   // =========================================================================
  //   // SCENARIO A: Clicking "Chat with Seller" from a Product Page (Create Chat Room)
  //   // =========================================================================
  //   if (sellerId && productId && !chatId) {
  //     // 1. Check if a chat room already exists between this buyer, seller, and product
  //     const { data: existingChat } = await supabase
  //       .from("chat")
  //       .select("*")
  //       .eq("buyer_id", user.id)
  //       .eq("seller_id", sellerId)
  //       .eq("prod_id", productId)
  //       .maybeSingle();

  //     if (existingChat) {
  //       return NextResponse.json(existingChat);
  //     }

  //     // 2. If it doesn't exist, create a brand new chat room row!
  //     const { data: newChat, error: chatError } = await supabase
  //       .from("chat")
  //       .insert([
  //         {
  //           buyer_id: user.id,
  //           seller_id: sellerId,
  //           prod_id: productId,
  //         },
  //       ])
  //       .select()
  //       .single();

  //     if (chatError) {
  //       return NextResponse.json(
  //         { error: chatError.message }, 
  //         { status: 500 }
  //         );
  //     }

  //     return NextResponse.json(newChat);
  //   }

  //   // =========================================================================
  //   // SCENARIO B: Typing a message inside an open chat box (Send Message)
  //   // =========================================================================
  //   if (chatId && message) {
  //     const payload = {
  //       chat_id: chatId,
  //       sender_id: user.id,
  //       message: message,
  //       read: false,
  //     };

  //     const { data: newMessage, error: dbError } = await supabase
  //       .from("chat_message")
  //       .insert([payload])
  //       .select()
  //       .single();

  //     if (dbError) {
  //       return NextResponse.json(
  //         { error: dbError.message }, 
  //         { status: 500 }
  //         );
  //     }

  //     return NextResponse.json(newMessage);
  //   }

  //   return NextResponse.json({ error: "Invalid request payload parameters." }, { status: 400 });

  // } catch (err: any) {
  //   return NextResponse.json({ error: err.message }, 
  //   { status: 500 })
  //   ;
  // }

