import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export interface ScoreEntry {
  ts: string;
  score: number;
  strength: string;
  weakness: string;
  tip: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { objectId, score, strength, weakness, tip } = body;

  if (!objectId || typeof score !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify ownership via exhibition
  const { data: obj } = await supabase
    .from("tok_objects")
    .select("id, exhibition_id, scores")
    .eq("id", objectId)
    .single();

  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: ex } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("id", obj.exhibition_id)
    .eq("user_id", user.id)
    .single();

  if (!ex) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing: ScoreEntry[] = Array.isArray(obj.scores) ? obj.scores : [];
  const entry: ScoreEntry = { ts: new Date().toISOString(), score, strength, weakness, tip };
  // Keep max 10 entries
  const updated = [...existing, entry].slice(-10);

  await supabase.from("tok_objects").update({ scores: updated }).eq("id", objectId);

  return NextResponse.json({ ok: true });
}
