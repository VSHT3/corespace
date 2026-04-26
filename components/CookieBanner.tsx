"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("cookies-acknowledged")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("cookies-acknowledged", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "var(--bg)",
        border: "2px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        whiteSpace: "nowrap",
        boxShadow: "4px 4px 0 0 var(--fg)",
      }}
    >
      <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>
        We use cookies for authentication.{" "}
        <Link href="/privacy" style={{ color: "var(--fg)", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
      </p>
      <button onClick={dismiss} className="btn-primary btn-primary-hover" style={{ padding: "4px 12px", whiteSpace: "nowrap" }}>
        Got it
      </button>
    </div>
  );
}
