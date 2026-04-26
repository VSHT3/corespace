import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { saveObject, deleteObject } from "../actions";
import ObjectCard from "./ObjectCard";
import type { TOKExhibition, TOKObject } from "@/types";

export default async function ExhibitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exhibition } = await supabase
    .from("tok_exhibitions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exhibition) notFound();

  const { data: objects } = await supabase
    .from("tok_objects")
    .select("*")
    .eq("exhibition_id", id)
    .order("position", { ascending: true });

  const ex = exhibition as TOKExhibition;
  const objs = (objects ?? []) as TOKObject[];
  const prompt = TOK_PROMPTS[ex.prompt_id] ?? `Prompt ${ex.prompt_id}`;

  const slots = [0, 1, 2];

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK Exhibitions</Link>
      </div>

      <div className="mb-8 space-y-2">
        <p className="eyebrow">Exhibition</p>
        <h1 className="heading" style={{ fontSize: "30px" }}>{ex.title}</h1>
        <div className="card" style={{ padding: "1rem 1.25rem", background: "var(--yellow)", marginTop: "0.75rem" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666", marginBottom: "4px" }}>
            Prompt {ex.prompt_id}
          </p>
          <p style={{ fontWeight: 600, lineHeight: 1.5 }}>{prompt}</p>
        </div>
      </div>

      <hr className="divider mb-8" />

      <p className="eyebrow mb-6">Your Three Objects</p>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {slots.map((slot) => {
          const obj = objs.find((o) => o.position === slot) ?? null;
          return (
            <ObjectCard
              key={slot}
              slot={slot}
              exhibitionId={id}
              object={obj}
              prompt={prompt}
              saveObject={saveObject}
              deleteObject={deleteObject}
            />
          );
        })}
      </div>
    </main>
  );
}
