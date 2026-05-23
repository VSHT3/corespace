"use client";

import { useState } from "react";
import { updateUsername } from "./actions";
import { useToast } from "@/lib/toast";

export default function UsernameForm({ initialUsername }: { initialUsername: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUsername ?? "");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialUsername) {
      setEditing(false);
      setValue(initialUsername ?? "");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      showToast("Username must be 3–20 letters, numbers, or underscores", "error");
      return;
    }
    setSaving(true);
    try {
      await updateUsername(trimmed);
      showToast("Username updated", "success");
      setEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update username";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setValue(initialUsername ?? "");
  }

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <p style={{ fontSize: "15px" }}>{initialUsername ?? "—"}</p>
        <button
          onClick={() => setEditing(true)}
          className="btn-ghost btn-ghost-hover"
          style={{ fontSize: "10px", padding: "3px 8px" }}
        >
          {initialUsername ? "Change" : "Set"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="field-input"
        style={{ width: "180px", padding: "4px 8px", fontSize: "14px" }}
        placeholder="yourname"
        pattern="[a-zA-Z0-9_]{3,20}"
        maxLength={20}
        autoFocus
        disabled={saving}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim() && !saving) handleSave(); }}
      />
      <button
        onClick={handleSave}
        disabled={saving || !value.trim()}
        className="btn-primary btn-primary-hover"
        style={{ fontSize: "10px", padding: "4px 10px", opacity: saving || !value.trim() ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        onClick={handleCancel}
        disabled={saving}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "10px", padding: "4px 10px" }}
      >
        Cancel
      </button>
    </div>
  );
}
