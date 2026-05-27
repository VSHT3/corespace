import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateExperience, deleteExperience, addReflection } from "../actions";
import type { CASExperience, CASReflection } from "@/types";
import DangerSubmitButton from "@/components/DangerSubmitButton";

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

export default async function CASDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exp } = await supabase
    .from("cas_experiences")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exp) notFound();
  const experience = exp as CASExperience;

  const { data: reflections } = await supabase
    .from("cas_reflections")
    .select("*")
    .eq("experience_id", id)
    .order("created_at", { ascending: false });

  const refs = (reflections ?? []) as CASReflection[];
  const meta = CATEGORY_META[experience.category] ?? { label: experience.category, color: "var(--border)" };

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard/cas" className="back-link">← CAS</Link>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.4rem" }}>
            <span className="tag" style={{ background: meta.color }}>{meta.label}</span>
            {experience.status === "completed" && <span className="tag tag-mint">Done</span>}
            {experience.status === "planned" && <span className="tag tag-sky">Planned</span>}
            {experience.status === "active" && <span className="tag tag-yellow">Active</span>}
          </div>
          <h1 className="heading" style={{ fontSize: "28px" }}>{experience.title}</h1>
        </div>
      </div>

      {/* Detail card */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "2rem" }}>
        <div style={{ height: "4px", background: meta.color }} />
        <div style={{ padding: "1.25rem" }}>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "1rem", fontSize: "14px" }}>
            {experience.description || "No description yet."}
          </p>

          <form action={updateExperience} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input type="hidden" name="id" value={experience.id} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Title</label>
                <input name="title" type="text" required defaultValue={experience.title} className="field-input" />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Category</label>
                <select name="category" required className="field-input" defaultValue={experience.category}>
                  <option value="creativity">Creativity</option>
                  <option value="activity">Activity</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Hours</label>
                <input name="hours" type="number" step="0.5" min="0" defaultValue={experience.hours} className="field-input" />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Status</label>
                <select name="status" className="field-input" defaultValue={experience.status}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Description</label>
              <textarea name="description" rows={2} defaultValue={experience.description} className="field-input" />
            </div>

            {/* Learning outcomes */}
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                Learning outcomes addressed
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {OUTCOMES.map((o, i) => {
                  const checked = (experience.learning_outcomes ?? []).includes(String(i + 1));
                  return (
                    <label key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer", lineHeight: 1.5 }}>
                      <input
                        type="checkbox"
                        name="learning_outcomes"
                        value={String(i + 1)}
                        defaultChecked={checked}
                        style={{ accentColor: "var(--fg)", width: "14px", height: "14px", flexShrink: 0 }}
                      />
                      <span>{i + 1}. {o}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary btn-primary-hover">Save changes</button>
            </div>
          </form>

          <form action={deleteExperience.bind(null, experience.id)} style={{ marginTop: "1rem" }}>
            <DangerSubmitButton>Delete experience</DangerSubmitButton>
          </form>
        </div>
      </div>

      {/* Reflections */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "2rem" }}>
        <div style={{ height: "4px", background: "var(--yellow)" }} />
        <div style={{ padding: "1.25rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>Reflections · {refs.length}</p>

          <form action={addReflection} style={{ marginBottom: "1.5rem" }}>
            <input type="hidden" name="experience_id" value={experience.id} />
            <textarea
              name="content"
              rows={3}
              placeholder="Write a reflection about this experience…"
              className="field-input"
              style={{ marginBottom: "0.5rem" }}
            />
            <button type="submit" className="btn-primary btn-primary-hover">Add reflection</button>
          </form>

          {refs.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#888" }}>No reflections yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {refs.map((r) => (
                <div key={r.id} style={{ background: "var(--bg)", border: "2px solid var(--border)", borderRadius: "var(--radius)", padding: "0.875rem 1rem" }}>
                  <p style={{ fontSize: "13px", lineHeight: 1.7, margin: 0 }}>{r.content}</p>
                  <p style={{ fontSize: "10px", color: "#aaa", marginTop: "6px", marginBottom: 0 }}>
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
