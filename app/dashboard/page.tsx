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
    href: "#",
    available: false,
    accent: "#bbf7d0",
  },
  {
    id: "ee",
    label: "Extended Essay",
    description:
      "Outline, draft, and iterate with AI feedback at every stage.",
    href: "#",
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

  return (
    <main className="page-main">
      <div className="mb-10 space-y-1">
        <p className="eyebrow">Signed in as {user.email}</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Dashboard</h1>
      </div>

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
                <span className="heading" style={{ fontSize: "14px", display: "block" }}>{mod.label}</span>
                <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.6" }}>{mod.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={mod.id}
              className="card-bump"
              style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: "180px", opacity: 0.6, cursor: "not-allowed" }}
            >
              <div style={{ height: "6px", background: mod.accent }} />
              <div style={{ padding: "1.25rem 1.5rem 2.75rem" }} className="space-y-3">
                <span className="heading" style={{ fontSize: "14px", display: "block" }}>{mod.label}</span>
                <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.6" }}>{mod.description}</p>
              </div>
              <span className="tag tag-sky" style={{ position: "absolute", bottom: "12px", right: "12px" }}>Soon</span>
            </div>
          )
        )}
      </div>
    </main>
  );
}
