"use client";

import { useState } from "react";
import ObjectCard from "./ObjectCard";

interface Props {
  slot: number;
  exhibitionId: string;
  prompt: string;
  saveObject: (formData: FormData) => Promise<void>;
  deleteObject: (exhibitionId: string, objectId: string) => Promise<void>;
}

export default function AddObjectSlot({ slot, exhibitionId, prompt, saveObject, deleteObject }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const slotLabel = ["first", "second", "third"][slot];
  const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
  const accent = accentColors[slot];

  if (isAdding) {
    return (
      <ObjectCard
        slot={slot}
        exhibitionId={exhibitionId}
        object={null}
        prompt={prompt}
        saveObject={saveObject}
        deleteObject={deleteObject}
        initialScores={[]}
      />
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      style={{
        width: "100%",
        minHeight: "240px",
        border: "2px dashed var(--border)",
        borderRadius: "var(--radius)",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "2rem",
        color: "#888",
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontSize: "28px", lineHeight: 1, color: accent, fontWeight: 300 }}>+</span>
      <span style={{ fontSize: "13px", fontWeight: 600 }}>
        Add {slotLabel} object
      </span>
    </button>
  );
}
