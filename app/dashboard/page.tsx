import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const modules = [
  {
    id: "tok",
    label: "TOK Exhibition",
    description:
      "Build and refine your Theory of Knowledge exhibition. Choose a prompt, select objects, and develop your justifications.",
    href: "/dashboard/tok",
    available: true,
  },
  {
    id: "cas",
    label: "CAS Reflections",
    description:
      "Track Creativity, Activity, and Service hours. Write structured reflections against learning outcomes.",
    href: "#",
    available: false,
  },
  {
    id: "ee",
    label: "Extended Essay",
    description:
      "Outline and draft your Extended Essay with AI-guided feedback at every stage.",
    href: "#",
    available: false,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex flex-col flex-1 px-6 py-16 max-w-4xl mx-auto w-full">
      <div className="mb-10 space-y-1">
        <p className="eyebrow">Signed in as {user.email}</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modules.map((mod) =>
          mod.available ? (
            <Link key={mod.id} href={mod.href} className="card-link space-y-3">
              <span className="heading" style={{ fontSize: "15px", display: "block" }}>{mod.label}</span>
              <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.6" }}>{mod.description}</p>
            </Link>
          ) : (
            <div
              key={mod.id}
              className="card space-y-3"
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            >
              <div className="flex items-center gap-2">
                <span className="heading" style={{ fontSize: "15px" }}>{mod.label}</span>
                <span className="tag tag-sky">Soon</span>
              </div>
              <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.6" }}>{mod.description}</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
