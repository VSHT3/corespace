import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Corespace is an AI-powered toolkit built by an IB Diploma student to make the TOK Exhibition, CAS portfolio, and Extended Essay more manageable.",
};

export default function AboutPage() {
  return (
    <main className="page-main" style={{ maxWidth: "720px" }}>
      <p className="eyebrow">About</p>
      <h1 className="heading" style={{ fontSize: "clamp(28px, 5vw, 48px)", marginBottom: "0.5rem" }}>
        Built by an IB student,<br />for IB students.
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "2.5rem" }}>
        Because the Core shouldn't feel impossible.
      </p>

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: "1rem" }}>
          The IB Diploma's three core components — Theory of Knowledge, CAS, and the Extended Essay — are supposed to be where the real intellectual growth happens. In practice, they often feel like three parallel bureaucratic processes with vague criteria, inconsistent teacher guidance, and deadlines that creep up all at once.
        </p>
        <p style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: "1rem" }}>
          Corespace started as a personal project to untangle the TOK Exhibition — specifically, the part where you have to write analytically about three objects without copying from anywhere and while somehow sounding like a philosopher. The tools that existed were either too generic or too expensive.
        </p>
        <p style={{ fontSize: "16px", lineHeight: 1.8 }}>
          What makes Corespace different is that the AI is trained on the actual IB TOK rubric, not general writing advice. It knows what a knowledge question is, why generic objects lose marks, and what an examiner means when they write "lucid and convincing" in the grade descriptors.
        </p>
      </section>

      <div
        className="card"
        style={{
          background: "var(--yellow)",
          marginBottom: "2.5rem",
          padding: "1.25rem 1.5rem",
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>What we&apos;re building</p>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "14px", lineHeight: 2, color: "#555" }}>
          <li><strong>TOK Exhibition helper</strong> — prompt selection, object builder, AI justification drafts, knowledge question generator, and AI scoring against the IB rubric. <span className="tag tag-mint" style={{ marginLeft: "6px" }}>Live</span></li>
          <li><strong>CAS tracker</strong> — activity log, reflection prompts, and strand coverage dashboard. <span className="tag" style={{ marginLeft: "6px", background: "#eee" }}>Coming soon</span></li>
          <li><strong>Extended Essay assistant</strong> — research question refiner, supervisor log, and structure checker. <span className="tag" style={{ marginLeft: "6px", background: "#eee" }}>Coming soon</span></li>
        </ul>
      </div>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="heading" style={{ fontSize: "20px", marginBottom: "1rem" }}>What Corespace is not</h2>
        <ul style={{ paddingLeft: "1.25rem", fontSize: "15px", lineHeight: 1.9, color: "#444" }}>
          <li>Not an essay mill. AI output is a starting draft — it always requires editing and personalisation.</li>
          <li>Not a replacement for your teacher. Use it alongside supervisor meetings, not instead of them.</li>
          <li>Not affiliated with the IB Organisation. Corespace is an independent student tool.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className="heading" style={{ fontSize: "20px", marginBottom: "1rem" }}>IB disclaimer</h2>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7 }}>
          Corespace is an independent service and is not affiliated with, endorsed by, or connected to the International Baccalaureate Organization (IBO). &quot;IB&quot;, &quot;IB Diploma&quot;, &quot;Theory of Knowledge&quot;, &quot;CAS&quot;, and &quot;Extended Essay&quot; are trademarks of the IBO. All curriculum references are for informational purposes only.
        </p>
      </section>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/dashboard/tok" className="btn-primary btn-primary-hover" style={{ padding: "10px 20px" }}>
          Start your exhibition
        </Link>
        <Link href="/contact" className="btn-ghost btn-ghost-hover" style={{ padding: "10px 20px" }}>
          Get in touch
        </Link>
      </div>
    </main>
  );
}
