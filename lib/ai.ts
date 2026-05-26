import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

const model = gateway("google/gemini-2.5-flash");

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIGenerationOptions {
  system: string;
  messages: AIChatMessage[];
  maxOutputTokens?: number;
  thinkingBudget?: number;
}

export async function generateAIResponse({
  system,
  messages,
  maxOutputTokens,
  thinkingBudget,
}: AIGenerationOptions): Promise<string> {
  const { text } = await generateText({
    model,
    system,
    messages,
    maxOutputTokens,
    ...(thinkingBudget != null
      ? { providerOptions: { google: { thinkingConfig: { thinkingBudget } } } }
      : {}),
  });
  return text;
}
