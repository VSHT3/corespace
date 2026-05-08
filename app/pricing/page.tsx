import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free plan for casual use. €4/month Student plan for unlimited TOK, CAS, and EE access. No hidden fees.",
};

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    accent: "#bbf7d0",
    description: "Everything you need to get started.",
    features: [
      "TOK Exhibition helper (3 exhibitions)",
      "AI feedback: 20 requests/month",
      "Basic object analysis",
    ],
    cta: "Get started",
    ctaHref: "/login",
    primary: false,
  },
  {
    name: "Student",
    price: "€4",
    period: "per month",
    accent: "#fde68a",
    description: "Full access for one student.",
    features: [
      "Unlimited TOK exhibitions",
      "AI feedback: unlimited",
      "CAS tracker (when available)",
      "EE assistant (when available)",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaHref: "/login",
    primary: true,
  },
  {
    name: "School",
    price: "Custom",
    period: "contact us",
    accent: "#fbcfe8",
    description: "Bulk licenses for schools and coordinators.",
    features: [
      "Everything in Student",
      "Coordinator dashboard",
      "Class progress overview",
      "Invoice billing",
      "Onboarding support",
    ],
    cta: "Contact us",
    ctaHref: "/contact",
    primary: false,
  },
];

export default function PricingPage() {
  return (
    <main className="page-main">
      <div
        className="space-y-2"
        style={{ marginBottom: "3rem", textAlign: "center" }}
      >
        <p className="eyebrow">Pricing</p>
        <h1 className="heading" style={{ fontSize: "40px" }}>
          Simple, honest pricing
        </h1>
        <p
          style={{
            color: "#555",
            maxWidth: "400px",
            margin: "0 auto",
            lineHeight: "1.7",
          }}
        >
          No hidden fees. Cancel anytime.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        {plans.map((p) => (
          <div
            key={p.name}
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              outline: p.primary ? "3px solid var(--fg)" : undefined,
              outlineOffset: p.primary ? "-1px" : undefined,
            }}
          >
            <div style={{ height: "5px", background: p.accent }} />
            <div style={{ padding: "1.5rem" }}>
              <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>
                {p.name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.4rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span className="heading" style={{ fontSize: "32px" }}>
                  {p.price}
                </span>
                <span style={{ color: "#888", fontSize: "12px" }}>
                  {p.period}
                </span>
              </div>
              <p
                style={{
                  color: "#555",
                  fontSize: "13px",
                  marginBottom: "1.25rem",
                  lineHeight: "1.6",
                }}
              >
                {p.description}
              </p>
              <div className="divider" style={{ marginBottom: "1rem" }} />
              <ul
                style={{
                  margin: "0 0 1.5rem",
                  paddingLeft: "1rem",
                  color: "#444",
                  fontSize: "13px",
                  lineHeight: "2",
                }}
              >
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href={p.ctaHref}
                className={
                  p.primary
                    ? "btn-primary btn-primary-hover"
                    : "btn-ghost btn-ghost-hover"
                }
                style={{
                  width: "100%",
                  padding: "9px 16px",
                  textAlign: "center",
                }}
              >
                {p.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#888",
          fontSize: "12px",
          marginTop: "2.5rem",
        }}
      >
        Student plan renews monthly. Cancel from your profile anytime. Payments processed by Paddle: they handle VAT and invoicing.
      </p>

      <div style={{ marginTop: "4rem", maxWidth: "600px", margin: "4rem auto 0" }}>
        <p className="eyebrow" style={{ textAlign: "center", marginBottom: "1.5rem" }}>FAQ</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", border: "2px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {[
            {
              q: "Can I try Corespace before paying?",
              a: "Yes. The Free plan gives you 3 exhibitions and 20 AI calls — no card required. Upgrade when you're ready.",
            },
            {
              q: "How is AI feedback different from just using ChatGPT?",
              a: "Corespace feeds the full IB exhibition rubric, all 35 prompts, and the official marking criteria to the AI before every response. The feedback is specific to your object and prompt, not generic.",
            },
            {
              q: "Is this cheating?",
              a: "No, as long as you use it as a thinking tool, not a ghostwriter. Corespace helps you understand what makes a strong justification and gives you feedback on your own writing — the same role a teacher or supervisor plays.",
            },
            {
              q: "What happens if I cancel?",
              a: "Your exhibitions and objects are saved. You move back to the Free tier limits. Your data is never deleted when you cancel — only when you explicitly delete your account.",
            },
            {
              q: "Is Corespace affiliated with the IB?",
              a: "No. Corespace is an independent study tool. IB and International Baccalaureate are registered trademarks of the International Baccalaureate Organisation, which does not endorse this product.",
            },
          ].map((item, i) => (
            <div key={i} style={{ padding: "1rem 1.25rem", borderTop: i > 0 ? "1px solid var(--border)" : undefined, background: "var(--bg)" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "0.4rem" }}>{item.q}</p>
              <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
