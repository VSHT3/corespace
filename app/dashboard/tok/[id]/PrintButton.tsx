"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-ghost btn-ghost-hover no-print"
      style={{ fontSize: "11px", padding: "4px 10px" }}
    >
      Print / Export
    </button>
  );
}
