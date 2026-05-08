import type { Metadata } from "next";
import Link from "next/link";
import { TOK_PROMPTS, TOK_CATEGORIES } from "@/lib/tok-prompts";

export const metadata: Metadata = {
  title: "All 35 TOK Exhibition Prompts",
  description: "The complete list of 35 official IB Theory of Knowledge exhibition prompts with descriptions, difficulty ratings, and knowledge area categories.",
};

const DIFFICULTY_LABELS = ["Accessible", "Straightforward", "Moderate", "Challenging", "Advanced"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  knowledge: "#fde68a",
  reliability: "#bbf7d0",
  ethics: "#fbcfe8",
  communication: "#bae6fd",
  culture: "#e9d5ff",
  change: "#fed7aa",
};

export default function TOKPromptsPage() {
  return (
    <main className="page-main" style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Reference</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>All 35 TOK Exhibition Prompts</h1>
        <p style={{ color: "#555", marginTop: "0.5rem", lineHeight: 1.6 }}>
          The official IB prompts for 2022–2027. Each prompt is grouped by knowledge area theme. Difficulty ratings are indicative — the best prompt is the one that fits your objects.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
            Start building your exhibition →
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {TOK_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", borderBottom: `3px solid ${CATEGORY_COLORS[cat.id] ?? "#eee"}`, paddingBottom: "0.5rem" }}>
              <h2 className="heading" style={{ fontSize: "16px", margin: 0 }}>{cat.label}</h2>
              <span style={{ fontSize: "11px", color: "#888", fontWeight: 700 }}>{cat.promptIds.length} prompts</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cat.promptIds.map((id) => {
                const p = TOK_PROMPTS[id];
                if (!p) return null;
                return (
                  <div
                    key={id}
                    className="card"
                    style={{
                      padding: "1rem 1.25rem",
                      borderLeft: `4px solid ${CATEGORY_COLORS[cat.id] ?? "var(--border)"}`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", minWidth: "24px", paddingTop: "2px" }}>{id}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "14px", lineHeight: 1.35, margin: "0 0 4px" }}>{p.title}</p>
                        <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#888" }}>{p.difficulty}/5</span>
                        <span style={{ fontSize: "10px", color: "#aaa", textAlign: "right" }}>{DIFFICULTY_LABELS[p.difficulty - 1]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: "3rem", padding: "1.5rem", background: "var(--yellow)", border: "2px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "4px 4px 0 0 var(--fg)" }}>
        <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Ready to build your exhibition?</p>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "1rem" }}>
          Use Corespace to pick your prompt, add three objects, and get AI feedback on every justification.
        </p>
        <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
          Start free →
        </Link>
      </div>
    </main>
  );
}
