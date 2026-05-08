import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corespace — IB Core made manageable",
  description:
    "AI-powered tools for IB Diploma students. TOK Exhibition helper, CAS tracker, and Extended Essay assistant — built by an IB student, for IB students.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Corespace",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: "AI-powered tools for IB Diploma students. TOK Exhibition helper, CAS tracker, and Extended Essay assistant.",
  url: "https://corespace.app",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 py-24" style={{ animation: "fadeUp 0.28s ease both" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            accent: "#fde68a",
          },
          {
            label: "Creativity Activity Service",
            desc: "Log hours, write structured reflections, and hit every learning outcome.",
            available: false,
            accent: "#bbf7d0",
          },
          {
            label: "Extended Essay",
            desc: "Outline, draft, and iterate with AI feedback at every stage.",
            available: false,
            accent: "#fbcfe8",
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
              <span className="tag tag-sky" style={{ position: "absolute", bottom: "12px", right: "12px" }}>
                Soon
              </span>
            )}
          </div>
        ))}
      </section>

      {/* TOK feature highlight */}
      <section className="mt-16 max-w-3xl w-full">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: "5px", background: "#fde68a" }} />
          <div style={{ padding: "1.75rem 2rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>TOK Exhibition — live now</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem 2rem" }}>
              {[
                "All 35 official IB prompts with AI chat",
                "3 objects per exhibition, IB-typed",
                "AI justification generator",
                "Knowledge question generator",
                "AI scoring: score/10 + actionable tip",
                "Word count targets (95–150 / object)",
                "Print-ready export",
                "Duplicate & reorder exhibitions",
              ].map((item) => (
                <p key={item} style={{ fontSize: "13px", color: "#444", margin: 0, display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </p>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
                Start your exhibition free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IB disclaimer */}
      <p style={{ marginTop: "3rem", fontSize: "11px", color: "#bbb", textAlign: "center", maxWidth: "36rem" }}>
        Corespace is an independent study tool not affiliated with or endorsed by the International Baccalaureate Organization. IB® is a registered trademark of the International Baccalaureate Organization.
      </p>
    </main>
  );
}
