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

export type AIIntent = "prompt_explainer" | "object_justification" | "object_scoring" | "justification_chat" | "object_ideas" | "knowledge_question" | "justification_improve" | "object_check";

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface AIRequestBody {
  intent: AIIntent;
  userMessage: string;
  context?: Record<string, string>;
  history?: ChatTurn[];
}

export interface AIResponseBody {
  text: string;
}
