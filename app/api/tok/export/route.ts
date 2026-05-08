import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { TOK_PROMPTS } from "@/lib/tok-prompts";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: exhibition } = await supabase
    .from("tok_exhibitions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exhibition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: objects } = await supabase
    .from("tok_objects")
    .select("*")
    .eq("exhibition_id", id)
    .order("position", { ascending: true });

  const prompt = TOK_PROMPTS[exhibition.prompt_id];

  const payload = {
    exportedAt: new Date().toISOString(),
    exhibition: {
      id: exhibition.id,
      title: exhibition.title,
      promptId: exhibition.prompt_id,
      promptTitle: prompt?.title ?? `Prompt ${exhibition.prompt_id}`,
      createdAt: exhibition.created_at,
    },
    objects: (objects ?? []).map((o: Record<string, unknown>) => ({
      position: o.position,
      title: o.title,
      type: o.object_type,
      description: o.description,
      justification: o.justification,
    })),
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename="tok-exhibition-${id.slice(0, 8)}.json"`,
    },
  });
}
