import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOK_PROMPTS } from "@/lib/tok-prompts";

export default async function TOKPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id, title, prompt_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const exhibition = exhibitions?.[0] ?? null;
  let objects: { id: string; justification: string | null }[] = [];
  let prompt = "";
  if (exhibition) {
    const { data: objs } = await supabase
      .from("tok_objects")
      .select("id, justification")
      .eq("exhibition_id", exhibition.id)
      .order("position", { ascending: true });
    objects = objs ?? [];
    const promptObj = TOK_PROMPTS[exhibition.prompt_id];
    prompt = promptObj?.title ?? `Prompt ${exhibition.prompt_id}`;
  }

  const justifiedCount = objects.filter(o => o.justification?.trim()).length;

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-8 space-y-1">
        <p className="eyebrow">Theory of Knowledge</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>TOK</h1>
      </div>

      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Components</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {exhibition ? (
          <Link
            href={`/dashboard/tok/${exhibition.id}`}
            className="card-bump"
            style={{ display: "block", textDecoration: "none", color: "inherit", padding: 0, overflow: "hidden" }}
          >
            <div style={{ height: "4px", background: "var(--yellow)" }} />
            <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
              <span className="eyebrow" style={{ display: "block", marginBottom: "2px" }}>TOK Exhibition · Prompt {exhibition.prompt_id}</span>
              <span className="heading" style={{ fontSize: "18px", display: "block" }}>{exhibition.title || prompt}</span>
              <span style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                <span style={{ display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: "24px", height: "6px", borderRadius: "2px", border: "1.5px solid var(--border)", background: i < objects.length ? (objects[i]?.justification?.trim() ? "var(--mint)" : "var(--yellow)") : "transparent" }} />
                  ))}
                </span>
                <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>
                  {objects.length}/3 objects · {justifiedCount}/3 justified
                </span>
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard/tok/exhibition"
            className="card-bump"
            style={{ padding: 0, overflow: "hidden", display: "block", textDecoration: "none", color: "inherit", minHeight: "160px" }}
          >
            <div style={{ height: "6px", background: "var(--yellow)" }} />
            <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
              <span className="heading" style={{ fontSize: "16px", display: "block", marginBottom: "0.5rem" }}>TOK Exhibition</span>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>Pick one of the 35 official prompts, build your three objects, get AI justifications.</p>
            </div>
          </Link>
        )}
        <Link
          href="/dashboard/tok/essay"
          className="card-link"
          style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: "160px", display: "block", color: "inherit", textDecoration: "none" }}
        >
          <div style={{ height: "6px", background: "var(--pink)" }} />
          <div style={{ padding: "1.25rem 1.5rem 2.75rem" }}>
            <span className="heading" style={{ fontSize: "16px", display: "block", marginBottom: "0.5rem" }}>TOK Essay</span>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>Structure your prescribed title response with AI guidance at each stage.</p>
          </div>
          <span className="tag tag-sky" style={{ position: "absolute", bottom: "12px", right: "12px" }}>Soon</span>
        </Link>
      </div>
    </main>
  );
}
