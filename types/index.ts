export interface TOKExhibition {
  id: string;
  user_id: string;
  prompt_id: number;
  title: string;
  created_at: string;
}

export interface TOKObject {
  id: string;
  exhibition_id: string;
  title: string;
  description: string | null;
  object_type: string | null;
  justification: string | null;
  position: number;
  scores: Record<string, unknown>;
  created_at: string;
}

export type AIIntent = "prompt_explainer" | "object_justification" | "object_scoring" | "justification_chat" | "object_ideas";

export interface AIRequestBody {
  intent: AIIntent;
  userMessage: string;
  context?: Record<string, string>;
}

export interface AIResponseBody {
  text: string;
}
