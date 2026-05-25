"use client";

import { useEffect } from "react";

export default function WorkspaceKeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "p" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.print();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        gap: "0.75rem",
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: "2rem",
        padding: "0.75rem",
        borderTop: "2px solid var(--border)",
        fontSize: "11px",
        color: "var(--muted)",
      }}
    >
      <span><kbd style={kbdStyle}>P</kbd> Print</span>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "18px",
  height: "18px",
  padding: "0 4px",
  marginRight: "4px",
  border: "1.5px solid var(--border)",
  borderRadius: "3px",
  background: "var(--surface)",
  fontSize: "10px",
  fontWeight: 700,
  lineHeight: 1,
};
