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
    const btn = e.currentTarget;
    btn.style.setProperty("--clip-size", "0%");
    btn.classList.remove("btn-danger-exiting");
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--enter-x", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--enter-y", `${e.clientY - rect.top}px`);
    btn.style.color = "#000";
    btn.classList.add("btn-danger-entering");
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    btn.style.color = "";
    btn.style.setProperty("--clip-size", "150%");
    btn.classList.remove("btn-danger-entering");
    btn.classList.add("btn-danger-exiting");
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
