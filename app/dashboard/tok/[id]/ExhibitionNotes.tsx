"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  exhibitionId: string;
}

const STORAGE_PREFIX = "tok-notes-";

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

export default function ExhibitionNotes({ exhibitionId }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          padding: "16px 10px",
          background: open ? "var(--fg)" : "var(--surface)",
          color: open ? "var(--bg)" : "var(--fg)",
          border: "2px solid var(--border)",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1.5,
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {open ? "Close" : "Notes"}
      </button>

      <div
        style={{
          position: "fixed",
          right: 0,
          top: "48%",
          transform: open
            ? "translateX(0) translateY(-50%)"
            : "translateX(100%) translateY(-50%)",
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
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "2px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            Notes
          </p>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Jot down thoughts…"
          className="hide-scrollbar"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            resize: "none",
            scrollbarWidth: "none",
            padding: "0.75rem 1rem",
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: "inherit",
            color: "var(--fg)",
            backgroundColor: "var(--surface)",
            backgroundImage: `url("${NOISE_URI}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            backgroundBlendMode: "soft-light",
            minHeight: "120px",
          }}
        />
      </div>
    </>,
    document.body,
  );
}
