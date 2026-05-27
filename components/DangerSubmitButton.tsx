"use client";

import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function DangerSubmitButton({ children }: Props) {
  const [enterPos, setEnterPos] = useState<{ x: number; y: number } | null>(null);

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setEnterPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleMouseLeave() {
    setEnterPos(null);
  }

  return (
    <button
      type="submit"
      className="btn-danger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          fontSize: "11px",
          padding: "4px 10px",
          "--enter-x": enterPos ? `${enterPos.x}px` : "50%",
          "--enter-y": enterPos ? `${enterPos.y}px` : "50%",
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}
