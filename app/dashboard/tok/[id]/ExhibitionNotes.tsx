"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  exhibitionId: string;
}

const STORAGE_PREFIX = "tok-notes-";

export default function ExhibitionNotes({ exhibitionId }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + exhibitionId);
    if (saved) setNotes(saved);
  }, [exhibitionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + exhibitionId, notes);
  }, [notes, exhibitionId]);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? "Close notes" : "Open notes"}
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          padding: "10px 6px",
          background: open ? "var(--fg)" : "var(--surface)",
          color: open ? "var(--bg)" : "var(--fg)",
          border: "2px solid var(--border)",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1.4,
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {open ? "Close notes" : "Notes"}
      </button>

      <div
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: open ? "translateX(0) translateY(-50%)" : "translateX(100%) translateY(-50%)",
          zIndex: 49,
          width: "300px",
          maxHeight: "420px",
          background: "var(--surface)",
          border: "2px solid var(--border)",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.22s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "4px", background: "var(--sky)" }} />
        <div style={{ padding: "0.75rem 1rem", borderBottom: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Notes</p>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, color: "#888", padding: 0 }}
          >
            ✕
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down thoughts…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            resize: "none",
            padding: "0.75rem 1rem",
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: "inherit",
            color: "var(--fg)",
            background: "var(--bg)",
            minHeight: "120px",
          }}
        />
        <div style={{ padding: "0.4rem 1rem", borderTop: "2px solid var(--border)", fontSize: "10px", color: "#aaa" }}>
          {notes.length > 0 ? `${notes.split(/\s+/).filter(Boolean).length} words` : "Start typing..."}
        </div>
      </div>
    </>, document.body);
}
