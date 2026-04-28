import Link from "next/link";

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
    ctaHref: "mailto:hello@corespace.app",
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
    </main>
  );
}
