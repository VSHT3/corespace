import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      style={{
        borderBottom: "2px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 1.5rem",
          height: "52px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Logo — far left */}
        <Link
          href="/"
          className="heading"
          style={{ fontSize: "20px", textDecoration: "none", color: "var(--fg)", letterSpacing: "-0.02em", justifySelf: "start" }}
        ><mark className="highlight-yellow" style={{ marginRight: "-0.28em", paddingRight: "0.28em" }}>Core</mark>space
        </Link>

        {/* Centre nav — truly centered */}
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="/features" className="back-link" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Features
          </Link>
          <Link href="/pricing" className="back-link" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Pricing
          </Link>
        </nav>

        {/* Right — far right */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", justifySelf: "end" }}>
          {user ? (
            <>
              <Link href="/profile" className="back-link" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Profile
              </Link>
              <Link
                href="/dashboard"
                className="btn-primary btn-sky"
                style={{ padding: "6px 14px" }}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn-primary btn-primary-hover" style={{ padding: "6px 14px" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
