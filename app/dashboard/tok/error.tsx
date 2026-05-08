"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TOKError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[TOK error]", error);
  }, [error]);

  return (
    <main className="page-main" style={{ textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Error</p>
      <h1 className="heading" style={{ fontSize: "28px", marginBottom: "1rem" }}>Something went wrong</h1>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "2rem", lineHeight: 1.6 }}>
        Could not load your TOK data. Your exhibitions are safe — this is likely a temporary network issue.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
          Try again
        </button>
        <Link href="/dashboard" className="btn-ghost btn-ghost-hover" style={{ padding: "8px 18px" }}>
          Dashboard
        </Link>
      </div>
    </main>
  );
}
