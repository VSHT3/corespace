import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { gemini } from "@/lib/gemini";
import type { AIRequestBody, AIResponseBody, AIIntent } from "@/types";

// Load reference docs once at module init (server-only, never sent to client)
function loadDoc(filename: string): string {
  try {
    return readFileSync(join(process.cwd(), "lib/ai-docs", filename), "utf-8");
  } catch {
    return "";
  }
}

const DOC_TOK_OVERVIEW = loadDoc("tok-overview.md");
const DOC_EXHIBITION_GUIDE = loadDoc("tok-exhibition-guide.md");

const BASE_CONTEXT = `${DOC_TOK_OVERVIEW}\n\n---\n\n${DOC_EXHIBITION_GUIDE}`;

function buildSystemPrompt(intent: AIIntent, context: Record<string, string> = {}): string {
  switch (intent) {
    case "prompt_explainer":
      return `${BASE_CONTEXT}

---

You are a knowledgeable peer helping a student think through their TOK exhibition. You are not a teacher or explainer — you are a thinking partner.

The student is considering this prompt:
Prompt ${context.promptId ?? ""}: "${context.promptTitle ?? ""}"
${context.promptDescription ? `\nPrompt description: ${context.promptDescription}` : ""}

How to engage:
- Think carefully through whatever the student asks — don't give surface answers
- Ask questions back when it helps the student think more clearly or when their question is vague
- Push back if their reasoning has a gap, gently but honestly
- Only explain the prompt if that's genuinely what they're asking
- Be concise but substantive — depth over length
- Write as a peer, not an authority
- Never produce text the student should copy verbatim into their submission`;

    case "object_justification":
      return `${BASE_CONTEXT}

---

You are an IB Theory of Knowledge expert writing a draft justification for a student's TOK exhibition object.

Exhibition prompt: "${context.prompt ?? ""}"
Object: "${context.objectTitle ?? ""}" (type: ${context.objectType || "unspecified"})
${context.objectDescription ? `Student's description: ${context.objectDescription}` : ""}

Write a clear, concise justification (3-4 sentences) explaining why this object is relevant to the prompt. Focus on the knowledge question it raises, the connection to ways of knowing or areas of knowledge, and what makes this object analytically interesting for the prompt. Write in first person as if the student is explaining their choice. Do not be generic — be specific to this object and this prompt.`;

    default:
      return BASE_CONTEXT;
  }
}

export async function POST(request: NextRequest) {
  let body: AIRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { intent, userMessage, context } = body;

  if (!intent || !userMessage) {
    return NextResponse.json({ error: "intent and userMessage required" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(intent, context ?? {});

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1000,
      },
    });

    return NextResponse.json<AIResponseBody>({ text: response.text ?? "" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "AI request failed";
    const isQuota = msg.includes("429") || msg.toLowerCase().includes("quota");
    return NextResponse.json(
      { error: isQuota ? "AI quota exceeded. Try again later." : "AI request failed. Please try again." },
      { status: isQuota ? 429 : 500 }
    );
  }
}
