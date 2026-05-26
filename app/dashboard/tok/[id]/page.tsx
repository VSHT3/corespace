import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { saveObject, deleteObject } from "../actions";
import ObjectCard from "./ObjectCard";
import AddObjectSlot from "./AddObjectSlot";
import ExhibitionTitleEditor from "./ExhibitionTitleEditor";
import PrintButton from "./PrintButton";
import WordCountSummary from "./WordCountSummary";
import RubricPanel from "./RubricPanel";
import ObjectIdeasButton from "./ObjectIdeasButton";
import SubmissionChecklist from "./SubmissionChecklist";
import ExhibitionNotes from "./ExhibitionNotes";
import DeleteExhibitionButton from "./DeleteExhibitionButton";
import WorkspaceKeyboardShortcuts from "@/components/WorkspaceKeyboardShortcuts";
import type { TOKExhibition, TOKObject } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: exhibition } = await supabase
    .from("tok_exhibitions")
    .select("title, prompt_id")
    .eq("id", id)
    .single();
  if (!exhibition) return { title: "Exhibition" };
  return {
    title: `${exhibition.title} · Prompt ${exhibition.prompt_id}`,
    robots: { index: false },
  };
}

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
  const promptObj = TOK_PROMPTS[ex.prompt_id];
  const prompt = promptObj?.title ?? `Prompt ${ex.prompt_id}`;

  const justifiedCount = objs.filter(o => o.justification?.trim()).length;
  const totalWords = objs.reduce((sum, o) => {
    const words = o.justification?.trim() ? o.justification.trim().split(/\s+/).length : 0;
    return sum + words;
  }, 0);

  return (
    <main style={{ flex: "1 1 auto", boxSizing: "border-box", animation: "fadeUp 0.28s ease both", padding: "2rem 2rem 4rem" }}>
      <ExhibitionNotes exhibitionId={id} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <Link href="/dashboard/tok" className="back-link">← TOK</Link>
          <p className="eyebrow" style={{ marginTop: "0.65rem", marginBottom: "0.25rem" }}>Exhibition</p>
          <ExhibitionTitleEditor exhibitionId={id} initialTitle={ex.title} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
          <span className="tag tag-yellow">Prompt {ex.prompt_id}</span>
          <PrintButton exhibitionId={id} />
          <DeleteExhibitionButton exhibitionId={id} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "inline-block",
            textAlign: "center",
            padding: "0 1rem 0.8rem",
            borderBottom: "6px solid var(--yellow)",
          }}
        >
          <h2
            id="tok-prompt-heading"
            className="heading"
            style={{ fontSize: "clamp(22px, 3vw, 40px)", lineHeight: 1.15, letterSpacing: "-0.03em", margin: 0 }}
          >
            {prompt}
          </h2>
        </div>
      </div>

      {promptObj?.description && (
        <aside
          style={{
            maxWidth: "720px",
            margin: "0 auto 2rem",
            background: "var(--yellow)",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1rem 1.25rem",
          }}
        >
          <p style={{ color: "#222", lineHeight: 1.7, margin: 0, fontWeight: 500, textAlign: "justify" }}>{promptObj.description}</p>
        </aside>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "960px", margin: "0 auto" }}>
        {[0, 1, 2].map((slot) => {
          const obj = objs.find((o) => o.position === slot) ?? null;
          return obj ? (
            <ObjectCard
              key={slot}
              slot={slot}
              exhibitionId={id}
              object={obj}
              prompt={prompt}
              saveObject={saveObject}
              deleteObject={deleteObject}
              initialScores={Array.isArray(obj.scores) ? obj.scores : []}
            />
          ) : (
            <AddObjectSlot key={slot} slot={slot} exhibitionId={id} prompt={prompt} saveObject={saveObject} deleteObject={deleteObject} />
          );
        })}
      </div>

      <div style={{ maxWidth: "960px", margin: "1.5rem auto 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {[0, 1, 2].map((slot) => {
              const obj = objs.find((o) => o.position === slot);
              const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
              const hasJustification = !!(obj?.justification?.trim());
              return (
                <div
                  key={slot}
                  title={obj ? `Object ${slot + 1}: ${obj.title}${hasJustification ? " (justified)" : " (no justification)"}` : `Object ${slot + 1}: empty`}
                  style={{
                    width: "28px",
                    height: "8px",
                    borderRadius: "2px",
                    border: "2px solid var(--border)",
                    background: obj ? (hasJustification ? accentColors[slot] : "var(--surface)") : "transparent",
                    position: "relative",
                  }}
                />
              );
            })}
            <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>
              {objs.length}/3 objects
              {justifiedCount > 0 && <> · {justifiedCount}/3 justified</>}
            </span>
          </div>
          <WordCountSummary initialJustifications={objs.map(o => o.justification)} />
        </div>

        <div style={{ marginTop: "2rem" }}>
          <ObjectIdeasButton prompt={prompt} promptId={ex.prompt_id} />
          <SubmissionChecklist objectCount={objs.length} justifiedCount={justifiedCount} totalWords={totalWords} />
          <RubricPanel />
        </div>
      </div>

      <WorkspaceKeyboardShortcuts />
    </main>
  );
}
