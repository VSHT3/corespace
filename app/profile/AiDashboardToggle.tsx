"use client";

import { useState } from "react";
import { updateAiDashboardPref } from "./actions";
import { useToast } from "@/lib/toast";

export default function AiDashboardToggle({ initialShow }: { initialShow: boolean }) {
  const [show, setShow] = useState(initialShow);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function toggle() {
    const next = !show;
    setSaving(true);
    try {
      await updateAiDashboardPref(next);
      setShow(next);
    } catch {
      showToast("Failed to update preference", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
      <span style={{ fontSize: "12px", color: "#888" }}>Show on dashboard</span>
      <button
        onClick={toggle}
        disabled={saving}
        style={{
          width: "32px",
          height: "18px",
          borderRadius: "9px",
          border: "2px solid var(--border)",
          background: show ? "var(--mint)" : "#e5e5e5",
          cursor: saving ? "wait" : "pointer",
          position: "relative",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "var(--fg)",
            position: "absolute",
            top: "2px",
            left: show ? "16px" : "2px",
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}
