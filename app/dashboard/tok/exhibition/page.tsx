import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { createExhibition, deleteExhibition } from "../actions";
import type { TOKExhibition } from "@/types";

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

  if (exhibition) {
    const prompt = TOK_PROMPTS[exhibition.prompt_id];
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
              {prompt?.title ?? `Prompt ${exhibition.prompt_id}`}
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

  return (
    <main className="page-main" style={{ maxWidth: "1000px" }}>
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">TOK Exhibition</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>Choose your prompt</h1>
        <p style={{ color: "#555", maxWidth: "640px" }}>
          Pick one of the 35 official IB prompts. This will be the central question your exhibition responds to.
          Read the descriptions to find an angle that resonates — you can only have one exhibition, so choose carefully.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "0.75rem" }}>
        {Object.entries(TOK_PROMPTS).map(([id, prompt]) => {
          const numId = parseInt(id);
          return (
            <form key={id} action={createExhibition}>
              <input type="hidden" name="prompt_id" value={id} />
              <input type="hidden" name="title" value="My TOK Exhibition" />
              <button
                type="submit"
                className="card-bump"
                style={{ width: "100%", textAlign: "left", cursor: "pointer", padding: "1rem 1.25rem", background: "var(--surface)", display: "block" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", minWidth: "20px", paddingTop: "2px" }}>{numId}</span>
                  <p style={{ fontWeight: 700, fontSize: "14px", lineHeight: 1.4 }}>{prompt.title}</p>
                </div>
                <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, paddingLeft: "calc(20px + 0.75rem)" }}>
                  {prompt.description}
                </p>
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
