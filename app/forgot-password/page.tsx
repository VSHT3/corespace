"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full space-y-4 text-center" style={{ maxWidth: "360px" }}>
          <p className="eyebrow">Check your inbox</p>
          <h1 className="heading" style={{ fontSize: "28px" }}>Reset link sent</h1>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Sent password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/login" className="back-link" style={{ fontSize: "13px" }}>
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full space-y-8" style={{ maxWidth: "360px" }}>
        <div className="space-y-1 text-center">
          <p className="eyebrow">Corespace</p>
          <h1 className="heading" style={{ fontSize: "28px" }}>Reset password</h1>
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
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="text-center" style={{ fontSize: "13px" }}>
          <Link href="/login" className="back-link">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
