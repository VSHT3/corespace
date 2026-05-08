import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description: "TOK Exhibition helper, CAS tracker, and Extended Essay assistant — every IB Core component covered.",
};

const features = [
  {
    label: "Theory of Knowledge",
    tag: "Available",
    tagColor: "tag-mint",
    accent: "#fde68a",
    href: "/dashboard/tok",
    bullets: [
      "All 35 official IB TOK prompts with difficulty ratings and descriptions",
      "Animated prompt picker sorted by knowledge area (Personal, Shared, Natural, Human, Arts, Math)",
      "AI chat on each prompt — ask what it's really asking, get 3 object ideas, explore KQs",
      "Build 3 objects per exhibition: title, type (8 IB categories), description, justification",
      "AI justification generator: context-aware draft using IB rubric + annotated examples",
      "AI justification improver: rewrite your draft to be stronger while keeping your ideas",
      "AI knowledge question generator: 3 IB-style KQs with rationale and best-fit recommendation",
      "AI scoring (1–10) with strength, weakness, and actionable tip based on IB rubric",
      "In-card AI refinement chat: iterate justifications in multi-turn conversation",
      "Live word count (95–150 per justification, 950 total) synced across the workspace",
      "Submission checklist: 8-point auto-tracking checklist before you submit",
      "Print-optimised export and JSON export for backup",
      "Multiple exhibitions: create, duplicate, delete, reorder objects within exhibitions",
      "Keyboard shortcuts: / for search, r for random prompt, Esc to clear filters",
    ],
  },
  {
    label: "Creativity Activity Service",
    tag: "Coming soon",
    tagColor: "tag-sky",
    accent: "#bbf7d0",
    href: "#",
    bullets: [
      "Log CAS hours across all three strands",
      "Write structured reflections against learning outcomes",
      "Track completion against IB requirements",
      "Export for coordinator review",
    ],
  },
  {
    label: "Extended Essay",
    tag: "Coming soon",
    tagColor: "tag-sky",
    accent: "#fbcfe8",
    href: "#",
    bullets: [
      "Build and refine your research question",
      "Outline chapters with AI guidance",
      "Iterative draft feedback",
      "Citation and bibliography tools",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="page-main">
      <div className="space-y-2" style={{ marginBottom: "3rem" }}>
        <p className="eyebrow">What's inside</p>
        <h1 className="heading" style={{ fontSize: "40px" }}>Features</h1>
        <p style={{ color: "#555", maxWidth: "480px", lineHeight: "1.7" }}>
          Every tool is built specifically for the IB Core: not a generic AI wrapper, but structured workflows that match how IB actually works.
        </p>
      </div>

      <div className="space-y-4">
        {features.map((f) => (
          <div key={f.label} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: "5px", background: f.accent }} />
            <div style={{ padding: "1.5rem 1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <h2 className="heading" style={{ fontSize: "17px" }}>{f.label}</h2>
                <span className={`tag ${f.tagColor}`}>{f.tag}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#444", fontSize: "13px", lineHeight: "1.9" }}>
                {f.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "3rem", display: "flex", gap: "0.75rem" }}>
        <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "10px 24px" }}>
          Get started free
        </Link>
        <Link href="/pricing" className="btn-ghost btn-ghost-hover" style={{ padding: "10px 24px" }}>
          See pricing
        </Link>
      </div>
    </main>
  );
}
