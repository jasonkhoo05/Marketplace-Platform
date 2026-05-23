import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { message, productName, productPrice, productDescription } = await req.json();
    }

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile"
        messages: [
            
        ]
            }
        ]
    })
}