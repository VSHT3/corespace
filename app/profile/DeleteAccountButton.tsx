"use client";

import { useState } from "react";
import { deleteAccount } from "./actions";
import DangerButton from "@/components/DangerButton";

export default function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const [error, setError] = useState("");

  async function handleDelete() {
    setStep("loading");
    setError("");
    try {
      await deleteAccount();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Deletion failed. Try again.");
      setStep("confirm");
    }
  }

  if (step === "idle") {
    return (
      <DangerButton onClick={() => setStep("confirm")} style={{ fontSize: "11px", padding: "5px 12px", width: "100%" }}>
        Delete account
      </DangerButton>
    );
  }

  if (step === "confirm") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "380px" }}>
        <p style={{ fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
          <strong>This is permanent.</strong> All your exhibitions, objects, and justifications will be deleted. This cannot be undone.
        </p>
        {error && (
          <p style={{ fontSize: "12px", color: "#c00", margin: 0 }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleDelete}
            className="btn-primary btn-primary-hover"
            style={{ fontSize: "11px", padding: "5px 14px", background: "#c00", borderColor: "#c00" }}
          >
            Yes, delete my account
          </button>
          <button
            onClick={() => { setStep("idle"); setError(""); }}
            className="btn-ghost btn-ghost-hover"
            style={{ fontSize: "11px", padding: "5px 12px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <p style={{ fontSize: "13px", color: "#888" }}>Deleting account…</p>
  );
}
