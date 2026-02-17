import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Ensure Node runtime for compatibility with the Gemini SDK
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("AI ERROR: Missing GEMINI_API_KEY env var");
      return NextResponse.json(
        { error: "Server not configured: missing API key" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let text = "";
    // If history is provided, use chat session for multi-turn context
    if (Array.isArray(history) && history.length > 0) {
      const mappedHistory = history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));
      const chat = model.startChat({ history: mappedHistory });
      const result = await chat.sendMessage(message);
      text = result.response.text();
    } else {
      const result = await model.generateContent(message);
      text = result.response.text();
    }

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
