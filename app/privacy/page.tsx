export default function PrivacyPage() {
  return (
    <main className="page-main" style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Legal</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Privacy Policy</h1>
        <p style={{ color: "#888", fontSize: "12px", marginTop: "0.5rem" }}>Last updated: April 2026</p>
      </div>

      <div style={{ color: "#333", fontSize: "14px", lineHeight: "1.8" }} className="space-y-6">
        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>What we collect</h2>
          <p>When you create an account we collect your email address and a hashed password. When you use the app we store the content you create (TOK exhibitions, objects, reflections). We do not collect names, phone numbers, or payment card details — Paddle acts as Merchant of Record and handles all payment processing; we never see your card.</p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>Why we collect it</h2>
          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
            <li>To authenticate you and keep your account secure</li>
            <li>To store your work so you can access it across devices</li>
            <li>To provide AI-powered feedback on your content</li>
            <li>To process subscription payments via Paddle</li>
          </ul>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>Who we share it with</h2>
          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
            <li><strong>Supabase</strong> — hosts our database and authentication. EU data residency.</li>
            <li><strong>Anthropic</strong> — processes your content to generate AI feedback. Content is not used to train models.</li>
            <li><strong>Paddle</strong> — Merchant of Record; handles all payment processing and tax compliance. We share only what Paddle requires (email). Paddle issues invoices and remits VAT on our behalf.</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>We do not sell your data. Ever.</p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>Cookies</h2>
          <p>We use session cookies strictly for authentication (keeping you logged in). No tracking cookies, no advertising cookies.</p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>Your rights (GDPR)</h2>
          <p>You have the right to access, correct, export, or delete your data at any time. Email us at <a href="mailto:privacy@ibcoreos.com" style={{ color: "var(--fg)" }}>privacy@ibcoreos.com</a> and we will respond within 30 days.</p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>How long we keep it</h2>
          <p>Your data is kept as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days.</p>
        </section>

        <div className="divider" />

        <section>
          <h2 className="heading" style={{ fontSize: "16px", marginBottom: "0.5rem" }}>Contact</h2>
          <p>Questions? <a href="mailto:privacy@ibcoreos.com" style={{ color: "var(--fg)" }}>privacy@ibcoreos.com</a></p>
        </section>
      </div>
    </main>
  );
}
