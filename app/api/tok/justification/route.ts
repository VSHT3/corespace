import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exhibitionId, objectId, justification } = await req.json();
  if (!exhibitionId || !objectId || typeof justification !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify object belongs to user's exhibition
  const { data: obj } = await supabase
    .from("tok_objects")
    .select("id, exhibition_id")
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

  await supabase.from("tok_objects").update({ justification }).eq("id", objectId);

  revalidatePath(`/dashboard/tok/${exhibitionId}`);
  return NextResponse.json({ ok: true });
}
