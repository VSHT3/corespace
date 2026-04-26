import Link from "next/link";

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
        gap: "0.5rem",
        flexShrink: 0,
      }}
    >
      <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
        © {new Date().getFullYear()} Corespace
      </p>
      <nav style={{ display: "flex", gap: "1.25rem" }}>
        {[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Pricing", href: "/pricing" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{ fontSize: "11px", color: "#aaa", textDecoration: "none" }}
            className="back-link"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
