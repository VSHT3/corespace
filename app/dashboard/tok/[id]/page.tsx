import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { saveObject, deleteObject, swapObjectPositions } from "../actions";
import ObjectCard from "./ObjectCard";
import ExhibitionTitleEditor from "./ExhibitionTitleEditor";
import PrintButton from "./PrintButton";
import WordCountSummary from "./WordCountSummary";
import RubricPanel from "./RubricPanel";
import ObjectIdeasButton from "./ObjectIdeasButton";
import SubmissionChecklist from "./SubmissionChecklist";
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

  const slots = [0, 1, 2];
  const justifiedCount = objs.filter(o => o.justification?.trim()).length;
  const isComplete = objs.length === 3 && justifiedCount === 3;
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
          <p style={{ color: "#555", lineHeight: 1.7, margin: 0 }}>{promptObj.description}</p>
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
        <p className="eyebrow">Three Objects</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {slots.map((slot) => {
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
          <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>
            {objs.length}/3 objects
            {objs.filter(o => o.justification?.trim()).length > 0 && (
              <> · {objs.filter(o => o.justification?.trim()).length}/3 justified</>
            )}
          </span>
          <WordCountSummary initialJustifications={objs.map(o => o.justification)} />
        </div>
      </div>

      {isComplete && (
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto 2rem",
            background: "var(--mint)",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem 1.5rem",
            boxShadow: "4px 4px 0 0 var(--fg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
              Exhibition complete!
            </p>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
              All 3 objects written and justified. Review each justification, then print or share with your supervisor.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <Link href="/dashboard/tok/exhibition" className="btn-ghost btn-ghost-hover" style={{ padding: "6px 14px", fontSize: "12px" }}>
              All exhibitions
            </Link>
          </div>
        </div>
      )}

      {objs.length >= 2 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "11px", color: "#aaa", display: "flex", alignItems: "center", marginRight: "4px" }}>Reorder:</span>
          {[[0,1],[1,2],[0,2]].map(([a,b]) => {
            const hasA = objs.some(o => o.position === a);
            const hasB = objs.some(o => o.position === b);
            if (!hasA || !hasB) return null;
            const labels = ["1st","2nd","3rd"];
            return (
              <form key={`${a}-${b}`} action={swapObjectPositions.bind(null, id, a, b)}>
                <button type="submit" className="btn-ghost btn-ghost-hover" style={{ fontSize: "10px", padding: "3px 8px" }}>
                  Swap {labels[a]} ↔ {labels[b]}
                </button>
              </form>
            );
          })}
        </div>
      )}

      <div className="objects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", alignItems: "start" }}>
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
              initialScores={Array.isArray(obj?.scores) ? obj.scores : []}
            />
          );
        })}
      </div>
    </main>
  );
}
