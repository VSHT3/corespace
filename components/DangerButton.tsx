"use client";

import { useState } from "react";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}

export default function DangerButton({
  onClick,
  disabled,
  children,
  style,
  type = "button",
}: Props) {
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn-danger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--enter-x": enterPos ? `${enterPos.x}px` : "50%",
          "--enter-y": enterPos ? `${enterPos.y}px` : "50%",
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}
