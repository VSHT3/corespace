"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function ResetCompletePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const pwStrength = password.length > 0
    ? password.length < 8 ? "weak"
    : password.length < 12 && !/[^a-zA-Z0-9]/.test(password) ? "fair"
    : "strong"
    : null;
  const pwStrengthColor = pwStrength === "weak" ? "#dc2626" : pwStrength === "fair" ? "#b45309" : "#16a34a";

  useEffect(() => {
    // Supabase SSR client picks up the session from the URL fragment automatically
    // on the next getSession call. We just need to confirm the session is established.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setError("Reset link invalid or expired. Request a new one.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full space-y-8" style={{ maxWidth: "360px" }}>
        <div className="space-y-1 text-center">
          <p className="eyebrow">Corespace</p>
          <h1 className="heading" style={{ fontSize: "28px" }}>New password</h1>
        </div>

        {!ready && !error && (
          <p style={{ textAlign: "center", fontSize: "14px", color: "#888" }}>Verifying…</p>
        )}

        {error && (
          <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "13px", padding: "8px 12px" }}>
            {error}
          </p>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="eyebrow block">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
                minLength={8}
              />
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
            </div>

            <div className="space-y-1">
              <label className="eyebrow block">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-primary-hover"
              style={{ width: "100%", padding: "10px 16px", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
