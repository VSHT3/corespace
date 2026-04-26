export interface TOKExhibition {
  id: string;
  user_id: string;
  prompt_id: number;
  created_at: string;
}

export interface TOKObject {
  id: string;
  exhibition_id: string;
  title: string;
  description: string | null;
  object_type: string | null;
  scores: Record<string, unknown>;
  created_at: string;
}

export interface AIRequestBody {
  prompt: string;
  systemPrompt?: string;
}

export interface AIResponseBody {
  text: string;
}
