import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";
import { createExhibition, deleteExhibition } from "../actions";
import type { TOKExhibition } from "@/types";
import PromptPicker from "./PromptPicker";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function ExhibitionEntryPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { new: showNew } = await searchParams;

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("*, tok_objects(id, justification)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (exhibitions ?? []) as (TOKExhibition & { tok_objects: { id: string; justification: string | null }[] })[];

  if (list.length === 0 || showNew === "1") {
    return (
      <main className="page-main" style={{ maxWidth: "1400px" }}>
        <div className="mb-6" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/tok" className="back-link">← TOK</Link>
          {list.length > 0 && (
            <Link href="/dashboard/tok/exhibition" className="back-link" style={{ marginLeft: "auto" }}>
              ← Back to my exhibitions
            </Link>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <p className="eyebrow">TOK Exhibition</p>
          <h1 className="heading" style={{ fontSize: "32px" }}>Choose your prompt</h1>
          {list.length > 0 && (
            <p style={{ color: "#555" }}>Creating new exhibition. You already have {list.length}.</p>
          )}
        </div>

        <PromptPicker createAction={createExhibition} />
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK</Link>
      </div>

      <div className="mb-8" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div className="space-y-1">
          <p className="eyebrow">TOK Exhibition</p>
          <h1 className="heading" style={{ fontSize: "32px" }}>My Exhibitions</h1>
          <p style={{ color: "#555" }}>{list.length} exhibition{list.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/tok/exhibition?new=1"
          className="btn-primary btn-primary-hover"
          style={{ padding: "8px 18px" }}
        >
          + New Exhibition
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {list.map((ex) => {
          const prompt = TOK_PROMPTS[ex.prompt_id];
          const objectCount = ex.tok_objects?.length ?? 0;
          const justifiedCount = ex.tok_objects?.filter(o => o.justification?.trim()).length ?? 0;
          const isComplete = objectCount === 3 && justifiedCount === 3;
          const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];

          return (
            <div key={ex.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: "5px", background: "var(--yellow)" }} />
              <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>{ex.title}</span>
                    <span className="tag tag-yellow">Prompt {ex.prompt_id}</span>
                    {isComplete && <span className="tag tag-mint">Complete</span>}
                  </div>
                  <p style={{ fontSize: "13px", color: "#555", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                    {prompt?.title ?? `Prompt ${ex.prompt_id}`}
                  </p>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {[0, 1, 2].map((slot) => {
                      const obj = ex.tok_objects?.find((_, i) => i === slot);
                      return (
                        <div
                          key={slot}
                          style={{
                            width: "24px",
                            height: "8px",
                            borderRadius: "2px",
                            border: "2px solid var(--border)",
                            background: slot < objectCount
                              ? (slot < justifiedCount ? accentColors[slot] : "var(--surface)")
                              : "transparent",
                          }}
                        />
                      );
                    })}
                    <span style={{ fontSize: "11px", color: "#888" }}>
                      {objectCount}/3 objects · {justifiedCount}/3 justified
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                  <Link href={`/dashboard/tok/${ex.id}`} className="btn-primary btn-primary-hover" style={{ padding: "6px 14px" }}>
                    Open →
                  </Link>
                  <form action={deleteExhibition.bind(null, ex.id)}>
                    <ConfirmSubmitButton
                      label="Delete"
                      confirmLabel="Yes, delete"
                      message="Delete this exhibition?"
                      style={{ color: "#c00", borderColor: "#c00", fontSize: "11px", padding: "6px 12px" }}
                    />
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
