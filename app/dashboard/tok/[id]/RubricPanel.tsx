"use client";

import { useState } from "react";

const RUBRIC = [
  { band: "Excellent", marks: "9–10", desc: "Insightful, precise, and convincing links between the three objects and the prompt. Justifications illuminate genuine knowledge questions with well-applied TOK concepts. Writing is lucid and analytical throughout." },
  { band: "Good", marks: "7–8", desc: "Clear and relevant links between objects and prompt. Reasoning is mostly well-developed with some genuine insight. TOK vocabulary used accurately if not always deeply." },
  { band: "Satisfactory", marks: "5–6", desc: "Adequate connections to the prompt but uneven — some objects more convincing than others. Tendency toward description over analysis in places. TOK concepts present but applied loosely." },
  { band: "Basic", marks: "3–4", desc: "Vague or partial links to the prompt. Justifications are mostly descriptive rather than analytical. Limited or inaccurate use of TOK language." },
  { band: "Rudimentary", marks: "1–2", desc: "Minimal connection to the prompt. Little or no genuine justification. Objects feel chosen arbitrarily." },
  { band: "None", marks: "0", desc: "Not submitted, non-prescribed prompt used, or no attempt to engage with the task." },
];

const bandColor = (marks: string) => {
  const n = parseInt(marks);
  if (n >= 9) return "var(--mint)";
  if (n >= 7) return "var(--sky)";
  if (n >= 5) return "var(--yellow)";
  return "var(--pink)";
};

export default function RubricPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto 2rem" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost btn-ghost-hover no-print"
        style={{ fontSize: "11px", padding: "4px 12px", marginBottom: open ? "0.75rem" : 0 }}
      >
        {open ? "▲ Hide marking rubric" : "▼ Show marking rubric"}
      </button>

      {open && (
        <div style={{ border: "2px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "0.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", borderBottom: "2px solid var(--border)", background: "var(--bg)", padding: "0.5rem 1rem" }}>
            <span className="eyebrow" style={{ marginRight: "2rem" }}>Band</span>
            <span className="eyebrow">Descriptor</span>
          </div>
          {RUBRIC.map((row) => (
            <div
              key={row.band}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "1rem",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid #eee",
                alignItems: "start",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "80px" }}>
                <span
                  className="tag"
                  style={{ background: bandColor(row.marks), fontSize: "10px", whiteSpace: "nowrap" }}
                >
                  {row.marks} pts
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#555" }}>{row.band}</span>
              </div>
              <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.6, margin: 0 }}>{row.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
