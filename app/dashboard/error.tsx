"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[Dashboard error]", error);
  }, [error]);

  return (
    <main className="page-main" style={{ textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Something went wrong</p>
      <h1 className="heading" style={{ fontSize: "28px", marginBottom: "1rem" }}>Dashboard error</h1>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "2rem", lineHeight: 1.6 }}>
        An unexpected error occurred. Your data is safe — try refreshing or returning to dashboard.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
          Try again
        </button>
        <Link href="/dashboard" className="btn-ghost btn-ghost-hover" style={{ padding: "8px 18px" }}>
          Back to dashboard
        </Link>
      </div>
      {error.digest && (
        <p style={{ fontSize: "10px", color: "#ccc", marginTop: "1.5rem", fontFamily: "monospace" }}>
          Error ID: {error.digest}
        </p>
      )}
    </main>
  );
}
