import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { message, prod_name, prod_price, prod_desc, isGreet } = await req.json();

    const helloPrompt = `Greet the customer warmly and let them know you're here to help with ${prod_name ?? "this product"}. 
    Keep it short, friendly and natural. Do not mention you are an AI.`;
 
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping a seller on Nexmart respond to customer messages.
    Reply directly to the customer in a friendly, casual, and helpful tone.
    ${prod_name ? `Product Name: ${prod_name}` : ""}
    ${prod_price ? `Product Price: ${prod_price}` : ""}
    ${prod_desc ? `Product Description: ${prod_desc}` : ""}
    
    Rules:
    - Keep replies short and friendly
    - Speak naturally like a real seller (e.g. "Hi! Yes we have stock")
    - Only answer questions related to this product or general shopping
    - If you are unsure or cannot answer, reply exactly with: "HANDOFF"
    - Do not make up information you don't know
    - Do not mention you are an AI in your reply`,
         },
        { role: "user", content: isGreet ? helloPrompt : message },
      ],
    });
 
    const reply = response.choices[0].message.content ?? "";
    const handoff = reply.trim() === "HANDOFF";
 
    return NextResponse.json({
      reply: handoff
        ? "Sorry, I'm not sure about this, kindly wait for seller reply, thanks."
        : reply,
      handoff,
    });
  } catch (error) {
    console.error("Groq error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again.", handoff: true },
      { status: 500 }
    );
  }
}
