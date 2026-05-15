"use client";

// Note: metadata must be exported from a server component — login page is client.
// Title set via layout template: "Sign in · Corespace"
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

function ConfirmationError({ onError }: { onError: (msg: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("error") === "confirmation_failed") {
      onError("Confirmation link invalid or expired. Try signing up again.");
    }
  }, [searchParams, onError]);
  return null;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const pwStrength = mode === "signup" && password.length > 0
    ? password.length < 8 ? "weak"
    : password.length < 12 && !/[^a-zA-Z0-9]/.test(password) ? "fair"
    : "strong"
    : null;
  const pwStrengthColor = pwStrength === "weak" ? "#dc2626" : pwStrength === "fair" ? "#b45309" : "#16a34a";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (mode === "signup") {
      setConfirmationSent(true);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  if (confirmationSent) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full space-y-4 text-center" style={{ maxWidth: "360px" }}>
          <p className="eyebrow">Check your inbox</p>
          <h1 className="heading" style={{ fontSize: "28px" }}>Confirm your email</h1>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Sent confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button
            onClick={() => { setConfirmationSent(false); setMode("login"); }}
            className="btn-ghost btn-ghost-hover"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <Suspense fallback={null}>
        <ConfirmationError onError={(msg) => setError(msg)} />
      </Suspense>
      <div className="w-full space-y-8" style={{ maxWidth: "360px" }}>
        <div className="space-y-1 text-center">
          <p className="eyebrow">Corespace</p>
          <h1 className="heading" style={{ fontSize: "28px" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="eyebrow block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="you@school.edu"
            />
          </div>

          <div className="space-y-1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="eyebrow block">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
            />
          </div>

          {pwStrength && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "#eee", overflow: "hidden" }}>
                <div style={{ height: "100%", width: pwStrength === "weak" ? "33%" : pwStrength === "fair" ? "66%" : "100%", background: pwStrengthColor, transition: "width 0.2s, background 0.2s" }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: pwStrengthColor, letterSpacing: "0.04em", minWidth: "36px" }}>
                {pwStrength}
              </span>
            </div>
          )}

          {error && (
            <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "13px", padding: "8px 12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-primary-hover"
            style={{ width: "100%", padding: "10px 16px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Loading…" : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <p style={{ fontSize: "13px", color: "#888" }}>
            {mode === "login" ? "No account?" : "Already have one?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ color: "var(--fg)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          {mode === "login" && (
            <p style={{ fontSize: "13px" }}>
              <Link href="/forgot-password" className="back-link">Forgot password?</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
