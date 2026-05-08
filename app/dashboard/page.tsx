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
    available: false,
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

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("user_id", user.id);

  const exhibitionIds = (exhibitions ?? []).map((e: { id: string }) => e.id);

  let objectCount = 0;
  let justifiedCount = 0;

  if (exhibitionIds.length > 0) {
    const { data: objects } = await supabase
      .from("tok_objects")
      .select("id, justification")
      .in("exhibition_id", exhibitionIds);

    objectCount = objects?.length ?? 0;
    justifiedCount = objects?.filter((o: { justification: string | null }) => o.justification?.trim()).length ?? 0;
  }

  const firstName = user.email?.split("@")[0] ?? "there";

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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { val: exhibitionIds.length, label: "Exhibition" + (exhibitionIds.length !== 1 ? "s" : ""), accent: "var(--yellow)" },
            { val: objectCount, label: objectCount !== 1 ? "Objects" : "Object", accent: "var(--mint)" },
            { val: justifiedCount, label: justifiedCount !== 1 ? "Justified" : "Justified", accent: "var(--pink)" },
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
