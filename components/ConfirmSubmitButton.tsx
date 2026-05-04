"use client";

import { useState } from "react";

interface ConfirmSubmitButtonProps {
  label: string;
  confirmLabel: string;
  cancelLabel?: string;
  message: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function ConfirmSubmitButton({
  label,
  confirmLabel,
  cancelLabel = "Cancel",
  message,
  disabled,
  style,
}: ConfirmSubmitButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirming(true)}
        className="btn-ghost btn-ghost-hover"
        style={style}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "#555", fontSize: "12px", fontWeight: 700 }}>
        {message}
      </span>
      <button
        type="submit"
        disabled={disabled}
        className="btn-ghost btn-ghost-hover"
        style={style}
      >
        {confirmLabel}
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
        {cancelLabel}
      </button>
    </div>
  );
}
