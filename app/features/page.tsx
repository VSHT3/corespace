import Link from "next/link";

const features = [
  {
    label: "Theory of Knowledge",
    tag: "Available",
    tagColor: "tag-mint",
    accent: "#fde68a",
    href: "/dashboard/tok",
    bullets: [
      "Pick from all 35 official TOK prompts",
      "Add and describe your three objects",
      "AI feedback on your justifications",
      "Track how each object connects to the prompt",
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
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div className="space-y-2" style={{ marginBottom: "3rem" }}>
        <p className="eyebrow">What's inside</p>
        <h1 className="heading" style={{ fontSize: "40px" }}>Features</h1>
        <p style={{ color: "#555", maxWidth: "480px", lineHeight: "1.7" }}>
          Every tool is built specifically for the IB Core — not a generic AI wrapper, but structured workflows that match how IB actually works.
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
