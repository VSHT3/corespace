"use client";

export default function DangerSubmitButton({ children }: { children: React.ReactNode }) {
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
      type="submit"
      className="btn-danger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ fontSize: "11px", padding: "4px 10px" }}
    >
      {children}
    </button>
  );
}
