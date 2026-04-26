import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import type { AIRequestBody, AIResponseBody } from "@/types";

export async function POST(request: NextRequest) {
  const body: AIRequestBody = await request.json();
  const { prompt, systemPrompt } = body;

  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-3-5-20251001",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json<AIResponseBody>({ text });
}
