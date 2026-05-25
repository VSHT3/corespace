"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookieConsent, setCookieConsent } from "@/lib/cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [performance, setPerformance] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
    }
    const handler = () => {
      if (!getCookieConsent()) setVisible(true);
    };
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  function acceptAll() {
    setCookieConsent(true, true);
    setVisible(false);
  }

  function rejectNonEssential() {
    setCookieConsent(false, false);
    setVisible(false);
  }

  function saveCustom() {
    setCookieConsent(analytics, performance);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "1.25rem",
        right: "1.25rem",
        zIndex: 100,
        maxWidth: "420px",
        background: "var(--surface)",
        border: "2px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.25rem",
        boxShadow: "4px 4px 0 0 var(--fg)",
      }}
    >
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Cookie Preferences</p>
      <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
        Essential cookies keep you signed in. Analytics and performance cookies help us improve Corespace.
      </p>

      {customizing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "12px", fontWeight: 700, display: "block", lineHeight: 1.3 }}>Essential</span>
              <span style={{ fontSize: "10px", color: "#888" }}>Keeps you signed in (always on)</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#888" }}>Required</span>
          </div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", cursor: "pointer" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "12px", fontWeight: 700, display: "block", lineHeight: 1.3 }}>Analytics</span>
              <span style={{ fontSize: "10px", color: "#888" }}>Page views and usage trends</span>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", flexShrink: 0 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", cursor: "pointer" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "12px", fontWeight: 700, display: "block", lineHeight: 1.3 }}>Performance</span>
              <span style={{ fontSize: "10px", color: "#888" }}>Load time and speed insights</span>
            </div>
            <input
              type="checkbox"
              checked={performance}
              onChange={(e) => setPerformance(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", flexShrink: 0 }}
            />
          </label>
        </div>
      ) : (
        <p style={{ fontSize: "11px", color: "#888", marginBottom: "0.75rem", lineHeight: 1.4 }}>
          <Link href="/privacy" style={{ color: "var(--fg)", textDecoration: "underline" }}>Privacy Policy</Link>
        </p>
      )}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {customizing ? (
          <>
            <button onClick={saveCustom} className="btn-primary btn-primary-hover" style={{ padding: "6px 14px", fontSize: "11px" }}>
              Save preferences
            </button>
            <button onClick={() => setCustomizing(false)} className="btn-ghost btn-ghost-hover" style={{ padding: "6px 14px", fontSize: "11px" }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={acceptAll} className="btn-primary btn-primary-hover" style={{ padding: "6px 14px", fontSize: "11px" }}>
              Accept all
            </button>
            <button onClick={rejectNonEssential} className="btn-ghost btn-ghost-hover" style={{ padding: "6px 14px", fontSize: "11px" }}>
              Reject non-essential
            </button>
            <button onClick={() => { setCustomizing(true); setAnalytics(false); setPerformance(false); }} className="back-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", padding: "6px 4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Customize
            </button>
          </>
        )}
      </div>
    </div>
  );
}
