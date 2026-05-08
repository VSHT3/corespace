import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-main" style={{ textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>404</p>
      <h1 className="heading" style={{ fontSize: "48px", marginBottom: "1rem" }}>
        Page not <mark className="highlight-pink" style={{ paddingRight: "0.5em" }}>found.</mark>
      </h1>
      <p style={{ color: "#555", fontSize: "15px", maxWidth: "360px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
        This page doesn&apos;t exist or was moved.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn-primary btn-primary-hover" style={{ padding: "10px 24px" }}>
          Go home
        </Link>
        <Link href="/dashboard" className="btn-ghost btn-ghost-hover" style={{ padding: "10px 24px" }}>
          Dashboard
        </Link>
      </div>
    </main>
  );
}
