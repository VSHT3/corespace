import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { createExhibition, deleteExhibition } from "../actions";
import type { TOKExhibition } from "@/types";

// Brief thematic tags per prompt to aid selection
const PROMPT_TAGS: Record<number, string> = {
  1:  "Nature of knowledge",
  2:  "Interpretation",
  3:  "Personal experience",
  4:  "Knowledge & society",
  5:  "Self-knowledge",
  6:  "Future & knowledge",
  7:  "Perspective",
  8:  "Language",
  9:  "Intuition",
  10: "Construction vs discovery",
  11: "Knowledge & values",
  12: "Certainty",
  13: "Evidence",
  14: "Ethics of knowledge",
  15: "Non-linguistic knowledge",
  16: "Knowledge & culture",
  17: "Value of knowledge",
  18: "Fact vs opinion",
  19: "A priori knowledge",
  20: "Imagination",
  21: "Categorisation",
  22: "Freedom of inquiry",
  23: "Equality of knowledge",
  24: "Limits of inquiry",
  25: "Shared knowledge",
  26: "Knower & knowledge",
  27: "Knowledge & power",
  28: "Science & religion",
  29: "Aesthetics",
  30: "Knowledge sharing",
  31: "Historical knowledge",
  32: "Mathematics",
  33: "Technology",
  34: "Emotion",
  35: "Ethics of inquiry",
};

export default async function ExhibitionEntryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("tok_exhibitions")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const exhibition = existing as TOKExhibition | null;

  // User already has an exhibition — show it with option to go in or delete
  if (exhibition) {
    const prompt = TOK_PROMPTS[exhibition.prompt_id] ?? `Prompt ${exhibition.prompt_id}`;
    return (
      <main className="page-main">
        <div className="mb-6">
          <Link href="/dashboard/tok" className="back-link">← TOK</Link>
        </div>

        <div className="mb-10 space-y-2">
          <p className="eyebrow">TOK Exhibition</p>
          <h1 className="heading" style={{ fontSize: "32px" }}>Your Exhibition</h1>
          <p style={{ color: "#555" }}>You can only have one exhibition. Continue working on it below.</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: "6px", background: "var(--yellow)" }} />
          <div style={{ padding: "1.5rem" }}>
            <p style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{exhibition.title}</p>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "1.25rem" }}>
              <span className="tag tag-yellow" style={{ marginRight: "8px" }}>Prompt {exhibition.prompt_id}</span>
              {prompt}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href={`/dashboard/tok/${exhibition.id}`} className="btn-primary btn-primary-hover">
                Open Exhibition →
              </Link>
              <form action={deleteExhibition.bind(null, exhibition.id)}>
                <button type="submit" className="btn-ghost btn-ghost-hover" style={{ color: "#c00", borderColor: "#c00" }}>
                  Delete & start over
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // No exhibition yet — show prompt browser
  return (
    <main className="page-main" style={{ maxWidth: "1000px" }}>
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">TOK Exhibition</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>Choose your prompt</h1>
        <p style={{ color: "#555" }}>
          Pick one of the 35 official IB prompts. This will be the central question your exhibition responds to.
          Choose carefully — you can only have one exhibition.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {Object.entries(TOK_PROMPTS).map(([id, text]) => {
          const numId = parseInt(id);
          return (
            <form key={id} action={createExhibition}>
              <input type="hidden" name="prompt_id" value={id} />
              <input type="hidden" name="title" value="My TOK Exhibition" />
              <button
                type="submit"
                className="card-link"
                style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "2px solid var(--border)", background: "var(--surface)", padding: "1rem 1.25rem", borderRadius: "var(--radius)" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", minWidth: "20px", paddingTop: "1px" }}>{numId}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>{text}</p>
                    <span className="tag" style={{ fontSize: "10px", padding: "1px 6px", borderColor: "#ddd", color: "#888" }}>
                      {PROMPT_TAGS[numId]}
                    </span>
                  </div>
                </div>
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
