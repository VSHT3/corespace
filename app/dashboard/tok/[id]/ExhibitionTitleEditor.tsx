"use client";

import { useState, useRef } from "react";
import { updateExhibitionTitle } from "../actions";

interface Props {
  exhibitionId: string;
  initialTitle: string;
}

export default function ExhibitionTitleEditor({ exhibitionId, initialTitle }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === initialTitle) {
      setTitle(initialTitle);
      setEditing(false);
      return;
    }
    setSaving(true);
    await updateExhibitionTitle(exhibitionId, trimmed);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") { setTitle(initialTitle); setEditing(false); }
        }}
        autoFocus
        disabled={saving}
        className="field-input heading"
        style={{
          fontSize: "22px",
          maxWidth: "360px",
          padding: "2px 6px",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit title"
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "text",
        textAlign: "left",
        fontFamily: "inherit",
      }}
    >
      <h1
        className="heading"
        style={{
          fontSize: "22px",
          maxWidth: "360px",
          borderBottom: "2px dashed transparent",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#ccc")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "transparent")}
      >
        {title}
      </h1>
    </button>
  );
}
