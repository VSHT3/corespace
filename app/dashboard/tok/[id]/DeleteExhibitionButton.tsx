"use client";

import { useState, useTransition } from "react";
import { deleteExhibition } from "../actions";

interface Props {
  exhibitionId: string;
}

export default function DeleteExhibitionButton({ exhibitionId }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => deleteExhibition(exhibitionId));
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <span style={{ color: "#555", fontSize: "12px", fontWeight: 700 }}>Delete this exhibition?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="btn-ghost btn-ghost-hover"
          style={{ fontSize: "11px", padding: "4px 10px", color: "#c00", borderColor: "#c00" }}
        >
          {isPending ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="back-link"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 0",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-ghost btn-ghost-hover"
      style={{ fontSize: "11px", padding: "4px 10px", color: "#c00", borderColor: "#c00" }}
    >
      Delete exhibition
    </button>
  );
}
