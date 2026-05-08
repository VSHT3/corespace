"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ExhibitionError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[Exhibition error]", error);
  }, [error]);

  return (
    <main className="page-main" style={{ textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Error</p>
      <h1 className="heading" style={{ fontSize: "28px", marginBottom: "1rem" }}>Could not load exhibition</h1>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "2rem", lineHeight: 1.6 }}>
        Your exhibition data is safe. This is likely a temporary issue — try refreshing.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} className="btn-primary btn-primary-hover" style={{ padding: "8px 18px" }}>
          Try again
        </button>
        <Link href="/dashboard/tok/exhibition" className="btn-ghost btn-ghost-hover" style={{ padding: "8px 18px" }}>
          My exhibitions
        </Link>
      </div>
    </main>
  );
}
