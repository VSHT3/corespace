import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TOKPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const exhibitionCount = exhibitions?.length ?? 0;
  const lastActivity = exhibitions?.[0]?.created_at
    ? new Date(exhibitions[0].created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;

  const modules = [
    {
      id: "exhibition",
      label: "TOK Exhibition",
      description: "Pick one of the 35 official prompts, build your three objects, get AI justifications.",
      href: "/dashboard/tok/exhibition",
      available: true,
      accent: "var(--yellow)",
    },
    {
      id: "essay",
      label: "TOK Essay",
      description: "Structure your prescribed title response with AI guidance at each stage.",
      href: "/dashboard/tok/essay",
      available: false,
      accent: "var(--pink)",
    },
  ];

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">Theory of Knowledge</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>TOK</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ color: "#555" }}>Choose which TOK component to work on.</p>
          {exhibitionCount > 0 && lastActivity && (
            <span style={{ fontSize: "12px", color: "#888" }}>
              Created {lastActivity}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {modules.map((mod) =>
          mod.available ? (
            <Link
              key={mod.id}
              href={mod.href}
              className="card-bump"
              style={{ padding: 0, overflow: "hidden", display: "block", textDecoration: "none", color: "inherit", position: "relative", minHeight: "160px" }}
            >
              <div style={{ height: "6px", background: mod.accent }} />
              <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
                <span className="heading" style={{ fontSize: "16px", display: "block", marginBottom: "0.5rem" }}>{mod.label}</span>
                <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>{mod.description}</p>
              </div>
            </Link>
          ) : (
            <Link
              key={mod.id}
              href={mod.href}
              className="card-link"
              style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: "160px", display: "block", color: "inherit", textDecoration: "none" }}
            >
              <div style={{ height: "6px", background: mod.accent }} />
              <div style={{ padding: "1.25rem 1.5rem 2.75rem" }}>
                <span className="heading" style={{ fontSize: "16px", display: "block", marginBottom: "0.5rem" }}>{mod.label}</span>
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
