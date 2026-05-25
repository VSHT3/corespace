import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const modules = [
  {
    id: "tok",
    label: "Theory of Knowledge",
    description:
      "Pick a prompt, build your exhibition, and sharpen every object justification.",
    href: "/dashboard/tok",
    available: true,
    accent: "#fde68a",
  },
  {
    id: "cas",
    label: "Creativity Activity Service",
    description:
      "Log hours, write structured reflections, and hit every learning outcome.",
    href: "/dashboard/cas",
    available: true,
    accent: "#bbf7d0",
  },
  {
    id: "ee",
    label: "Extended Essay",
    description:
      "Outline, draft, and iterate with AI feedback at every stage.",
    href: "/dashboard/ee",
    available: false,
    accent: "#fbcfe8",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, show_ai_limit_on_dashboard")
    .eq("id", user.id)
    .single();

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id, title, prompt_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const exhibitionIds = (exhibitions ?? []).map((e: { id: string }) => e.id);
  const latestExhibition = exhibitions?.[0] ?? null;

  let objectCount = 0;
  let justifiedCount = 0;
  let totalWords = 0;
  let latestObjects: { exhibition_id: string; justification: string | null }[] = [];

  if (exhibitionIds.length > 0) {
    const { data: objects } = await supabase
      .from("tok_objects")
      .select("id, exhibition_id, justification")
      .in("exhibition_id", exhibitionIds);

    const allObjects = objects ?? [];
    objectCount = allObjects.length;
    justifiedCount = allObjects.filter((o) => o.justification?.trim()).length;
    totalWords = allObjects.reduce((sum, o) => {
      const w = o.justification?.trim() ? o.justification.trim().split(/\s+/).length : 0;
      return sum + w;
    }, 0);
    if (latestExhibition) {
      latestObjects = allObjects.filter((o) => o.exhibition_id === latestExhibition.id);
    }
  }

  const latestJustified = latestObjects.filter((o) => o.justification?.trim()).length;

  let aiCalls = 0;
  const showAiOnDashboard = profile?.show_ai_limit_on_dashboard ?? true;
  if (showAiOnDashboard && exhibitionIds.length > 0) {
    const { data: objects } = await supabase
      .from("tok_objects")
      .select("justification, scores")
      .in("exhibition_id", exhibitionIds);
    aiCalls = (objects ?? []).reduce((count, o) => {
      let c = 0;
      if (o.justification?.trim()) c += 1;
      if (o.scores && typeof o.scores === "object" && !Array.isArray(o.scores) && Object.keys(o.scores).length > 0) {
        c += 1;
      }
      return count + c;
    }, 0);
  }
  const aiLimit = 20;

  const firstName = profile?.username ?? user.email?.split("@")[0] ?? "there";

  return (
    <main className="page-main">
      <div className="mb-8 space-y-1">
        <p className="eyebrow">Welcome back</p>
        <h1 className="heading" style={{ fontSize: "42px" }}>
          Hey, {firstName}.
        </h1>
      </div>

      {exhibitionIds.length > 0 && (
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${showAiOnDashboard ? 5 : 4}, 1fr)`,
            gap: "0.75rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { val: 1, label: "Exhibition", accent: "var(--yellow)" },
            { val: objectCount, label: objectCount !== 1 ? "Objects" : "Object", accent: "var(--mint)" },
            { val: `${justifiedCount}/3`, label: "Justified", accent: "var(--pink)" },
            { val: totalWords, label: "Words written", accent: "var(--sky)" },
            ...(showAiOnDashboard ? [{ val: aiCalls + " / " + aiLimit, label: "AI calls", accent: "var(--mint)" as const }] : []),
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{ padding: 0, overflow: "hidden", textAlign: "center" }}
            >
              <div style={{ height: "4px", background: stat.accent }} />
              <div style={{ padding: "1rem 0.75rem 1.1rem" }}>
                <span className="heading" style={{ fontSize: "28px", display: "block" }}>{stat.val}</span>
                <span className="eyebrow">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {latestExhibition && (
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Continue where you left off</p>
          <Link
            href={`/dashboard/tok/${latestExhibition.id}`}
            className="card-bump"
            style={{ display: "block", textDecoration: "none", color: "inherit", padding: 0, overflow: "hidden" }}
          >
            <div style={{ height: "4px", background: "var(--yellow)" }} />
            <div style={{ padding: "1rem 1.25rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: "2px" }}>TOK Exhibition · Prompt {latestExhibition.prompt_id}</span>
                <span className="heading" style={{ fontSize: "18px" }}>{latestExhibition.title}</span>
                <span style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
                  <span style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: "24px", height: "6px", borderRadius: "2px", border: "1.5px solid var(--border)", background: i < latestObjects.length ? (latestObjects[i]?.justification?.trim() ? "var(--mint)" : "var(--yellow)") : "transparent" }} />
                    ))}
                  </span>
                  <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>
                    {latestObjects.length}/3 objects · {latestJustified}/3 justified
                  </span>
                </span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#888", whiteSpace: "nowrap" }}>Open →</span>
            </div>
          </Link>
        </div>
      )}

      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Modules</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modules.map((mod) =>
          mod.available ? (
            <Link
              key={mod.id}
              href={mod.href}
              className="card-bump"
              style={{ padding: 0, overflow: "hidden", display: "block", textDecoration: "none", color: "inherit", position: "relative", minHeight: "180px" }}
            >
              <div style={{ height: "6px", background: mod.accent }} />
              <div style={{ padding: "1.25rem 1.5rem 1.5rem" }} className="space-y-3">
                <span className="heading" style={{ fontSize: "16px", display: "block" }}>{mod.label}</span>
                <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>{mod.description}</p>
              </div>
            </Link>
          ) : (
            <Link
              key={mod.id}
              href={mod.href}
              className="card-link"
              style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: "180px", display: "block", color: "inherit", textDecoration: "none" }}
            >
              <div style={{ height: "6px", background: mod.accent }} />
              <div style={{ padding: "1.25rem 1.5rem 2.75rem" }} className="space-y-3">
                <span className="heading" style={{ fontSize: "16px", display: "block" }}>{mod.label}</span>
                <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>{mod.description}</p>
              </div>
              <span className="tag tag-sky" style={{ position: "absolute", bottom: "12px", right: "12px" }}>Soon</span>
            </Link>
          )
        )}
      </div>
    </main>
  );
}
