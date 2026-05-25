import Link from "next/link";

export default function TOKEssayPage() {
  return (
    <main className="page-main" style={{ textAlign: "center", paddingTop: "6rem" }}>
      <span className="tag tag-sky" style={{ marginBottom: "1rem" }}>Coming soon</span>
      <h1 className="heading" style={{ fontSize: "28px", marginBottom: "0.5rem" }}>TOK Essay</h1>
      <p style={{ color: "#555", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
        Structure your prescribed title response with AI guidance at each stage — from initial analysis to final draft.
      </p>
      <Link href="/dashboard/tok" className="back-link">← Back to TOK</Link>
    </main>
  );
}
