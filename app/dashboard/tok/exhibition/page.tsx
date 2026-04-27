import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { createExhibition, deleteExhibition } from "../actions";
import type { TOKExhibition } from "@/types";
import PromptPicker from "./PromptPicker";

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
    <main className="page-main" style={{ maxWidth: "1400px" }}>
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK</Link>
      </div>

      <div className="mb-6 space-y-2">
        <p className="eyebrow">TOK Exhibition</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>Choose your prompt</h1>
        <p style={{ color: "#555", maxWidth: "640px" }}>
          Pick one of the 35 official IB prompts. Watch them organize themselves into themes —
          then click any prompt to start your exhibition.
        </p>
      </div>

      <PromptPicker createAction={createExhibition} />
    </main>
  );
}
