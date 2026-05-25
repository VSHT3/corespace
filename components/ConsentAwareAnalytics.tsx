"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getCookieConsent, type CookieConsent } from "@/lib/cookie-consent";

export default function ConsentAwareAnalytics() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());

    const handler = () => setConsent(getCookieConsent());
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  if (!consent) return null;

  return (
    <>
      {consent.analytics && <Analytics />}
      {consent.performance && <SpeedInsights />}
    </>
  );
}
