import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { gemini } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
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

    case "object_ideas":
      return `${BASE_CONTEXT}

---

You are an IB TOK expert helping a student brainstorm objects for their exhibition.

Exhibition prompt: "${context.prompt ?? ""}"
Prompt number: ${context.promptId ?? ""}

Generate exactly 3 concrete object suggestions. For each object:
1. Describe a specific, real-world object (not abstract concepts — a specific photograph, artifact, document, data visualization, artwork, tweet, etc.)
2. Give a one-sentence explanation of why it connects to this prompt
3. Suggest the object type (Personal / Cultural / Natural / Linguistic / Mathematical / Scientific / Artistic / Historical)

Format as:
**Object 1: [Name]** (Type: [type])
[One sentence on the knowledge question it raises and how it links to the prompt]

**Object 2: [Name]** (Type: [type])
[explanation]

**Object 3: [Name]** (Type: [type])
[explanation]

Make the three objects varied — different types, different angles on the prompt. Be specific: not "a newspaper article" but "The New York Times front page from 9/12/2001". Not "a photograph" but "Dorothea Lange's Migrant Mother, 1936".`;

    case "justification_chat":
      return `${BASE_CONTEXT}

---

You are a TOK examiner helping a student improve their exhibition object justification.

Exhibition prompt: "${context.prompt ?? ""}"
Object: "${context.objectTitle ?? ""}" (type: ${context.objectType || "unspecified"})
${context.objectDescription ? `Description: ${context.objectDescription}` : ""}
${context.justification ? `Current justification:\n${context.justification}` : "No justification yet."}

Your role:
- Help the student strengthen their justification through dialogue
- Give specific, actionable suggestions — not generic advice
- When asked to rewrite or improve, provide the improved text
- If they ask "is this good?", give an honest assessment with specific reasons
- Keep responses focused and concise
- Never write their work for them without them asking — prefer prompting them to think
- Refer to their specific object and prompt, never be generic`;

    case "object_scoring":
      return `${BASE_CONTEXT}

---

You are an IB Theory of Knowledge examiner assessing a student's exhibition object and justification.

Exhibition prompt: "${context.prompt ?? ""}"
Object: "${context.objectTitle ?? ""}" (type: ${context.objectType || "unspecified"})
${context.objectDescription ? `Description: ${context.objectDescription}` : ""}
${context.justification ? `Justification: ${context.justification}` : "No justification written yet."}

Assess this object and respond with EXACTLY this JSON structure and nothing else:
{
  "score": <number 1-10>,
  "strength": "<one sentence: what this object does well>",
  "weakness": "<one sentence: the biggest gap or weakness>",
  "tip": "<one concrete sentence the student can act on to improve>"
}

Score rubric: 9-10 = examiner-ready, strong knowledge question + clear prompt link; 7-8 = good, minor gaps; 5-6 = adequate but generic; 3-4 = weak connection or vague; 1-2 = off-prompt or no justification.`;

    case "knowledge_question":
      return `${BASE_CONTEXT}

---

You are an IB TOK examiner helping a student formulate a precise knowledge question for their exhibition object.

Exhibition prompt: "${context.prompt ?? ""}"
Object: "${context.objectTitle ?? ""}" (type: ${context.objectType || "unspecified"})
${context.objectDescription ? `Description: ${context.objectDescription}` : ""}

Generate exactly 3 candidate knowledge questions for this object. Each must:
1. Begin with "To what extent…", "How do we know…", "What role does…", "Is…", or another genuine KQ opener
2. Be open-ended (no yes/no answer), contestable, and directly tied to this specific object
3. Connect clearly to the exhibition prompt

Format:
**KQ 1:** [question]
*Why it works:* [one sentence]

**KQ 2:** [question]
*Why it works:* [one sentence]

**KQ 3:** [question]
*Why it works:* [one sentence]

Then add one sentence: "Best fit for justification: KQ [n] — [brief reason]."`;

    default:
      return BASE_CONTEXT;
  }
}

const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: NextRequest) {
  let body: AIRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok: withinLimit } = checkRateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute before trying again." }, { status: 429 });
  }

  const { intent, userMessage, context } = body;

  if (!intent || !userMessage) {
    return NextResponse.json({ error: "Both intent and userMessage are required." }, { status: 400 });
  }

  const validIntents: AIIntent[] = ["prompt_explainer", "object_justification", "object_scoring", "justification_chat", "object_ideas", "knowledge_question"];
  if (!validIntents.includes(intent)) {
    return NextResponse.json({ error: `Unknown intent: ${intent}` }, { status: 400 });
  }

  if (typeof userMessage !== "string" || userMessage.trim().length === 0) {
    return NextResponse.json({ error: "userMessage must be a non-empty string." }, { status: 400 });
  }

  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long. Max 4000 characters." }, { status: 413 });
  }

  const systemPrompt = buildSystemPrompt(intent, context ?? {});

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: intent === "object_scoring" ? 400 : 1000,
      },
    });

    const text = response.text ?? "";
    return NextResponse.json<AIResponseBody>({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
      return NextResponse.json({ error: "AI rate limit reached. Please wait a moment and try again." }, { status: 429 });
    }
    if (msg.toLowerCase().includes("safety") || msg.toLowerCase().includes("blocked")) {
      return NextResponse.json({ error: "Request blocked by content safety filter. Please rephrase." }, { status: 400 });
    }
    console.error("[AI route error]", msg);
    return NextResponse.json({ error: "AI request failed. Please try again." }, { status: 500 });
  }
}
