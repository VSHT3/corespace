"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  prompt: string;
  promptId: number;
}

export default function ObjectIdeasButton({ prompt, promptId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState("");
  const [error, setError] = useState("");

  async function fetchIdeas() {
    if (ideas) { setOpen(true); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "object_ideas",
          userMessage: "Give me 3 object ideas for this prompt.",
          context: { prompt, promptId: String(promptId) },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setIdeas(data.text);
      setOpen(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto 1.5rem" }}>
      <button
        onClick={open ? () => setOpen(false) : fetchIdeas}
        disabled={loading}
        className="btn-ghost btn-ghost-hover no-print"
        style={{ fontSize: "11px", padding: "4px 12px" }}
      >
        {loading ? "Generating ideas…" : open ? "▲ Hide object ideas" : "▼ Object ideas (AI)"}
      </button>

      {error && (
        <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "12px", padding: "6px 10px", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      {open && ideas && (
        <div
          style={{
            marginTop: "0.75rem",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem 1.5rem",
            background: "var(--surface)",
            fontSize: "13px",
            lineHeight: 1.7,
            color: "#333",
          }}
        >
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>AI-suggested objects</p>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: "0 0 0.5em" }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
            }}
          >
            {ideas}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
