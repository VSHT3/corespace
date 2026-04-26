import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { createExhibition, deleteExhibition } from "./actions";
import type { TOKExhibition } from "@/types";

export default async function TOKPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">TOK</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Exhibition Helper</h1>
        <p style={{ color: "#555" }}>
          Choose a prompt, build your three objects, get AI-powered justifications.
        </p>
      </div>

      {/* Create new exhibition */}
      <div className="card mb-10">
        <p className="eyebrow mb-4">New Exhibition</p>
        <form action={createExhibition} className="space-y-4">
          <div>
            <label htmlFor="title" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
              Exhibition title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Untitled Exhibition"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="prompt_id" style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
              TOK Prompt
            </label>
            <select
              id="prompt_id"
              name="prompt_id"
              required
              className="field-input"
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select a prompt —</option>
              {Object.entries(TOK_PROMPTS).map(([id, text]) => (
                <option key={id} value={id}>{id}. {text}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary btn-primary-hover">
            Create Exhibition →
          </button>
        </form>
      </div>

      {/* Existing exhibitions */}
      {exhibitions && exhibitions.length > 0 && (
        <div>
          <p className="eyebrow mb-4">Your Exhibitions</p>
          <div className="space-y-3">
            {(exhibitions as TOKExhibition[]).map((ex) => (
              <div key={ex.id} className="card-bump" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, marginBottom: "2px" }}>{ex.title}</p>
                  <p style={{ fontSize: "13px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {TOK_PROMPTS[ex.prompt_id] ?? `Prompt ${ex.prompt_id}`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link href={`/dashboard/tok/${ex.id}`} className="btn-primary btn-primary-hover">
                    Open
                  </Link>
                  <form action={deleteExhibition.bind(null, ex.id)}>
                    <button type="submit" className="btn-ghost btn-ghost-hover" style={{ color: "#c00", borderColor: "#c00" }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exhibitions && exhibitions.length === 0 && (
        <p style={{ color: "#888", fontSize: "13px" }}>No exhibitions yet. Create one above.</p>
      )}
    </main>
  );
}
