import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Corespace team.",
};

export default function ContactPage() {
  return (
    <main className="page-main" style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Support</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Contact us</h1>
      </div>

      <div className="card space-y-5">
        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>General enquiries</p>
          <a href="mailto:hello@corespace.app" style={{ fontSize: "15px", color: "var(--fg)", fontWeight: 700 }}>
            hello@corespace.app
          </a>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Privacy &amp; data requests</p>
          <a href="mailto:privacy@corespace.app" style={{ fontSize: "15px", color: "var(--fg)", fontWeight: 700 }}>
            privacy@corespace.app
          </a>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
            GDPR requests, data export, account deletion.
          </p>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Response time</p>
          <p style={{ fontSize: "14px", color: "#555" }}>We aim to reply within 2 business days.</p>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Quick links</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="/privacy" style={{ fontSize: "12px", color: "var(--fg)", textDecoration: "underline" }}>Privacy Policy</a>
            <a href="/terms" style={{ fontSize: "12px", color: "var(--fg)", textDecoration: "underline" }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </main>
  );
}
