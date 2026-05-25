import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createExperience } from "./actions";
import type { CASExperience } from "@/types";

const OUTCOMES = [
  "Identify own strengths and develop areas for growth",
  "Demonstrate that challenges have been undertaken, developing new skills",
  "Demonstrate how to initiate and plan a CAS experience",
  "Show commitment to and perseverance in CAS experiences",
  "Demonstrate the skills and recognize the benefits of working collaboratively",
  "Demonstrate engagement with issues of global significance",
  "Recognize and consider the ethics of choices and actions",
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  creativity: { label: "Creativity", color: "var(--pink)" },
  activity: { label: "Activity", color: "var(--sky)" },
  service: { label: "Service", color: "var(--mint)" },
};

export default async function CASPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: experiences } = await supabase
    .from("cas_experiences")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const exps = (experiences ?? []) as CASExperience[];
  const totalHours = exps.reduce((s, e) => s + (e.hours || 0), 0);
  const completed = exps.filter((e) => e.status === "completed").length;
  const coveredOutcomes = new Set(exps.flatMap((e) => e.learning_outcomes ?? []));

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-8">
        <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Creativity · Activity · Service</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>CAS Tracker</h1>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          { val: exps.length, label: "Experiences", accent: "var(--mint)" },
          { val: `${totalHours}h`, label: "Hours logged", accent: "var(--sky)" },
          { val: completed, label: "Completed", accent: "var(--pink)" },
          { val: `${coveredOutcomes.size}/7`, label: "Outcomes met", accent: "var(--yellow)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: 0, overflow: "hidden", textAlign: "center" }}>
            <div style={{ height: "4px", background: s.accent }} />
            <div style={{ padding: "1rem 0.75rem 1.1rem" }}>
              <span className="heading" style={{ fontSize: "28px", display: "block" }}>{s.val}</span>
              <span className="eyebrow">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add experience form */}
      <details style={{ marginBottom: "2rem" }}>
        <summary
          className="btn-ghost btn-ghost-hover"
          style={{ display: "inline-block", cursor: "pointer", fontSize: "12px", padding: "6px 14px", userSelect: "none" }}
        >
          + New experience
        </summary>
        <div className="card" style={{ marginTop: "0.75rem", padding: "1.25rem" }}>
          <form action={createExperience} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                Title
              </label>
              <input name="title" type="text" required maxLength={120} placeholder="e.g. School newspaper" className="field-input" />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                Category
              </label>
              <select name="category" required className="field-input" defaultValue="creativity">
                <option value="creativity">Creativity</option>
                <option value="activity">Activity</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                Description
              </label>
              <textarea name="description" rows={2} className="field-input" placeholder="Briefly describe this experience…" />
            </div>
            <button type="submit" className="btn-primary btn-primary-hover">
              Create experience
            </button>
          </form>
        </div>
      </details>

      {/* Experience grid */}
      {exps.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, marginBottom: "0.5rem" }}>No CAS experiences yet</p>
          <p style={{ fontSize: "13px", color: "#555" }}>Click &quot;+ New experience&quot; above to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {exps.map((exp) => {
            const meta = CATEGORY_META[exp.category] ?? { label: exp.category, color: "var(--border)" };
            return (
              <Link
                key={exp.id}
                href={`/dashboard/cas/${exp.id}`}
                className="card-bump"
                style={{ display: "block", textDecoration: "none", color: "inherit", padding: 0, overflow: "hidden" }}
              >
                <div style={{ height: "4px", background: meta.color }} />
                <div style={{ padding: "1rem 1.25rem 1.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.4rem" }}>
                    <span className="tag" style={{ background: meta.color, fontSize: "10px" }}>{meta.label}</span>
                    {exp.status === "completed" && <span className="tag tag-mint" style={{ fontSize: "10px" }}>Done</span>}
                    {exp.status === "planned" && <span className="tag tag-sky" style={{ fontSize: "10px" }}>Planned</span>}
                  </div>
                  <span className="heading" style={{ fontSize: "15px", display: "block", marginBottom: "0.3rem" }}>{exp.title}</span>
                  <span style={{ fontSize: "12px", color: "#888" }}>{exp.hours}h · {(exp.learning_outcomes ?? []).length}/7 outcomes</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
