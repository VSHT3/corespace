import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 py-24" style={{ animation: "fadeUp 0.28s ease both" }}>
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="eyebrow">Corespace</p>
          <h1 className="heading" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
            Master the <mark className="highlight-yellow" style={{ paddingRight: "0.6em", paddingTop: "0.18em", marginTop: "-0.08em" }}>IB Core.</mark>
            <br />
            <span style={{ color: "#888" }}>Without the chaos.</span>
          </h1>
        </div>

        <p style={{ color: "#555", fontSize: "18px", lineHeight: "1.7", maxWidth: "36rem", margin: "0 auto" }}>
          AI-powered tools for Theory of Knowledge, CAS reflections, and Extended
          Essays: built by an IB student, for IB students.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "10px 24px" }}>
            Get Started Free
          </Link>
          <a href="#features" className="btn-ghost btn-ghost-hover" style={{ padding: "10px 24px" }}>
            See Features
          </a>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {[
            { val: "35", label: "official prompts" },
            { val: "AI", label: "justification help" },
            { val: "Free", label: "to start" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "15px", display: "block", letterSpacing: "-0.02em" }}>{stat.val}</span>
              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section
        id="features"
        className="mt-24 max-w-3xl w-full grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Theory of Knowledge",
            desc: "Pick a prompt, build your exhibition, and sharpen every object justification.",
            available: true,
            accent: "#fde68a", // yellow
          },
          {
            label: "Creativity Activity Service",
            desc: "Log hours, write structured reflections, and hit every learning outcome.",
            available: false,
            accent: "#bbf7d0", // mint
          },
          {
            label: "Extended Essay",
            desc: "Outline, draft, and iterate with AI feedback at every stage.",
            available: false,
            accent: "#fbcfe8", // pink
          },
        ].map((f) => (
          <div
            key={f.label}
            className="card-bump"
            style={{ padding: 0, overflow: "hidden", position: "relative", textAlign: "left", minHeight: "180px" }}
          >
            <div style={{ height: "6px", background: f.accent }} />
            <div className="space-y-3" style={{ padding: "1.25rem 1.5rem 2.75rem" }}>
              <span className="heading block" style={{ fontSize: "16px", display: "block" }}>{f.label}</span>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>{f.desc}</p>
            </div>
            {!f.available && (
              <span
                className="tag tag-sky"
                style={{ position: "absolute", bottom: "12px", right: "12px" }}
              >
                Soon
              </span>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
