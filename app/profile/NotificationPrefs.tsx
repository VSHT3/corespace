"use client";

import { useState } from "react";
import { updateNotificationPrefs } from "./actions";
import { useToast } from "@/lib/toast";

export default function NotificationPrefs({
  initialStudyTips,
  initialProductUpdates,
}: {
  initialStudyTips: boolean;
  initialProductUpdates: boolean;
}) {
  const [studyTips, setStudyTips] = useState(initialStudyTips);
  const [productUpdates, setProductUpdates] = useState(initialProductUpdates);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function toggle(key: "email_study_tips" | "email_product_updates", value: boolean) {
    const next = { email_study_tips: studyTips, email_product_updates: productUpdates, [key]: value };
    setSaving(true);
    try {
      await updateNotificationPrefs(next);
      if (key === "email_study_tips") setStudyTips(value);
      else setProductUpdates(value);
    } catch {
      showToast("Failed to update preference", "error");
    } finally {
      setSaving(false);
    }
  }

  const toggleStyle = (on: boolean) => ({
    width: "36px",
    height: "20px",
    borderRadius: "10px",
    border: "2px solid var(--border)",
    background: on ? "var(--mint)" : "#e5e5e5",
    cursor: saving ? "wait" : "pointer",
    position: "relative" as const,
    transition: "background 0.15s",
    flexShrink: 0,
  });

  const knobStyle = (on: boolean) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "var(--fg)",
    position: "absolute" as const,
    top: "2px",
    left: on ? "18px" : "2px",
    transition: "left 0.15s",
  });

  return (
    <div className="space-y-4">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600 }}>Study tips &amp; TOK guidance</p>
          <p style={{ fontSize: "12px", color: "#888" }}>Weekly IB TOK tips and prompt guidance</p>
        </div>
        <button onClick={() => toggle("email_study_tips", !studyTips)} disabled={saving} style={toggleStyle(studyTips)}>
          <div style={knobStyle(studyTips)} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600 }}>Product updates</p>
          <p style={{ fontSize: "12px", color: "#888" }}>New features and improvements</p>
        </div>
        <button onClick={() => toggle("email_product_updates", !productUpdates)} disabled={saving} style={toggleStyle(productUpdates)}>
          <div style={knobStyle(productUpdates)} />
        </button>
      </div>
    </div>
  );
}
