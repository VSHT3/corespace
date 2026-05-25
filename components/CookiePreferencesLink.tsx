"use client";

import { clearCookieConsent } from "@/lib/cookie-consent";

export default function CookiePreferencesLink() {
  function reopen() {
    clearCookieConsent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={reopen}
      style={{ fontSize: "11px", color: "#aaa", textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      className="back-link"
    >
      Cookie Preferences
    </button>
  );
}
