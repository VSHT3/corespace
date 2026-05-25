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
    <main
      className="page-main"
      style={{
        width: "100%",
        maxWidth: "1800px",
        padding: "1.5rem 1.5rem 4rem",
      }}
    >
      <section
        aria-labelledby="tok-prompt-heading"
        className="workspace-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1fr) minmax(420px, 980px) minmax(180px, 1fr)",
          alignItems: "start",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <Link href="/dashboard/tok/exhibition" className="back-link">← TOK Exhibition</Link>
          <p className="eyebrow" style={{ marginTop: "0.65rem", marginBottom: "0.25rem" }}>Exhibition</p>
          <ExhibitionTitleEditor exhibitionId={id} initialTitle={ex.title} />
        </div>

        <div
          style={{
            justifySelf: "center",
            textAlign: "center",
            padding: "0.35rem 0.75rem 0.6rem",
            borderBottom: "6px solid var(--yellow)",
            filter: "drop-shadow(5px 5px 0 var(--surface))",
          }}
        >
          <h2
            id="tok-prompt-heading"
            className="heading"
            style={{
              fontSize: "clamp(24px, 3.4vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {prompt}
          </h2>
        </div>

        <div style={{ justifySelf: "end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <span className="tag tag-yellow">Prompt {ex.prompt_id}</span>
          <PrintButton exhibitionId={id} />
        </div>
      </section>

      {promptObj?.description && (
        <aside
          style={{
            maxWidth: "860px",
            margin: "0 auto 3rem",
            background: "var(--yellow)",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1rem 1.25rem",
            boxShadow: "4px 4px 0 0 var(--fg)",
          }}
        >
          <p style={{ color: "#222", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{promptObj.description}</p>
        </aside>
      )}

      <ObjectIdeasButton prompt={prompt} promptId={ex.prompt_id} />
      <SubmissionChecklist objectCount={objs.length} justifiedCount={justifiedCount} totalWords={totalWords} />
      <RubricPanel />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <p className="eyebrow">{["Add your first object", "Add a second object", "Two down, one to go", "Three Objects"][objs.length]}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {objs.length > 0 && (
            <div style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2].map((slot) => {
                const obj = objs.find((o) => o.position === slot);
                const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
                const hasJustification = !!(obj?.justification?.trim());
                return (
                  <div
                    key={slot}
                    title={obj ? `Object ${slot + 1}: ${obj.title}${hasJustification ? " (justified)" : " (no justification)"}` : `Object ${slot + 1}: empty`}
                    style={{
                      width: "32px",
                      height: "10px",
                      borderRadius: "2px",
                      border: "2px solid var(--border)",
                      background: obj ? (hasJustification ? accentColors[slot] : "var(--surface)") : "transparent",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {obj && !hasJustification && (
                      <div style={{ position: "absolute", inset: 0, background: accentColors[slot], opacity: 0.35 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>
            {objs.length}/3 objects
            {justifiedCount > 0 && (
              <> · {justifiedCount}/3 justified</>
            )}
          </span>
          <WordCountSummary initialJustifications={objs.map(o => o.justification)} />
        </div>
      </div>

      {objs.length === 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <AddObjectSlot slot={0} exhibitionId={id} prompt={prompt} saveObject={saveObject} deleteObject={deleteObject} />
        </div>
      )}

      {objs.length === 1 && (
        <div className="workspace-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "70%", margin: "0 auto" }}>
          <ObjectCard
            slot={0}
            exhibitionId={id}
            object={objs[0]}
            prompt={prompt}
            saveObject={saveObject}
            deleteObject={deleteObject}
            initialScores={Array.isArray(objs[0]?.scores) ? objs[0].scores : []}
          />
          <AddObjectSlot slot={1} exhibitionId={id} prompt={prompt} saveObject={saveObject} deleteObject={deleteObject} />
        </div>
      )}

      {objs.length === 2 && (
        <>
          <div className="workspace-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "0 auto" }}>
            {[0, 1].map((pos) => {
              const obj = objs.find((o) => o.position === pos) ?? null;
              return (
                <ObjectCard
                  key={pos}
                  slot={pos}
                  exhibitionId={id}
                  object={obj}
                  prompt={prompt}
                  saveObject={saveObject}
                  deleteObject={deleteObject}
                  initialScores={Array.isArray(obj?.scores) ? obj.scores : []}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <AddObjectSlot slot={2} exhibitionId={id} prompt={prompt} saveObject={saveObject} deleteObject={deleteObject} />
          </div>
        </>
      )}

      {objs.length === 3 && (
        <div className="objects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", alignItems: "start" }}>
          {[0, 1, 2].map((pos) => {
            const obj = objs.find((o) => o.position === pos) ?? null;
            return (
              <ObjectCard
                key={pos}
                slot={pos}
                exhibitionId={id}
                object={obj}
                prompt={prompt}
                saveObject={saveObject}
                deleteObject={deleteObject}
                initialScores={Array.isArray(obj?.scores) ? obj.scores : []}
              />
            );
          })}
        </div>
      )}

      <WorkspaceKeyboardShortcuts />
    </main>
  );
}
