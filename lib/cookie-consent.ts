const STORAGE_KEY = "corespace-cookie-consent";

export interface CookieConsent {
  analytics: boolean;
  performance: boolean;
  essential: true;
  updatedAt: string;
}

const DEFAULT_CONSENT: CookieConsent = {
  analytics: false,
  performance: false,
  essential: true,
  updatedAt: "",
};

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function setCookieConsent(analytics: boolean, performance: boolean): void {
  const consent: CookieConsent = {
    analytics,
    performance,
    essential: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-change"));
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null;
}

export function clearCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("cookie-consent-change"));
}
