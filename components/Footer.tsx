import Link from "next/link";
import CookiePreferencesLink from "./CookiePreferencesLink";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "TOK Prompts", href: "/tok-prompts" },
  { label: "Tips", href: "/tips" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "2px solid var(--border)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <p style={{ fontSize: "11px", color: "#aaa", margin: 0, fontWeight: 700 }}>
          Corespace
        </p>
        <span style={{ fontSize: "11px", color: "#ccc" }}>·</span>
        <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
          © {new Date().getFullYear()}
        </p>
      </div>
      <nav style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{ fontSize: "11px", color: "#aaa", textDecoration: "none" }}
            className="back-link"
          >
          {l.label}
            </Link>
          ))}
          <CookiePreferencesLink />
        </nav>
    </footer>
  );
}
