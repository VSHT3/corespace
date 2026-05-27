"use client";

export default function DangerButton({
  onClick,
  disabled,
  children,
  style,
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--enter-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--enter-y", `${e.clientY - rect.top}px`);
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.setProperty("--enter-x", "50%");
    e.currentTarget.style.setProperty("--enter-y", "50%");
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn-danger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {children}
    </button>
  );
}
