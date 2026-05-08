import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const upcomingFeatures = [
  "Log hours across all three strands: Creativity, Activity, Service",
  "Write structured reflections against the 7 learning outcomes",
  "Track completion — see which outcomes still need evidence",
  "IB-format evidence links and description fields",
  "Supervisor review export (PDF/print-ready)",
  "Deadline and milestone reminders",
];

export default async function CASPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="page-main">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">Coming soon</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>
          <mark className="highlight-mint" style={{ paddingRight: "0.5em" }}>CAS</mark> Tracker
        </h1>
        <p style={{ color: "#555", maxWidth: "460px", lineHeight: 1.7 }}>
          Log your Creativity, Activity, and Service hours with structured reflections that map directly to IB learning outcomes.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "2rem" }}>
        <div style={{ height: "5px", background: "var(--mint)" }} />
        <div style={{ padding: "1.5rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>Planned features</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#444", fontSize: "14px", lineHeight: 2 }}>
            {upcomingFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          background: "var(--mint)",
          border: "2px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          boxShadow: "4px 4px 0 0 var(--fg)",
        }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Get early access</p>
          <p style={{ fontSize: "13px", color: "#555" }}>Student plan includes CAS tracker when it launches.</p>
        </div>
        <Link href="/pricing" className="btn-primary btn-primary-hover" style={{ padding: "8px 18px", flexShrink: 0 }}>
          See plans →
        </Link>
      </div>
    </main>
  );
}
