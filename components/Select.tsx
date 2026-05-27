"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  defaultValue?: string;
  options: Option[];
  placeholder?: string;
  accentColor?: string;
}

export function Select({ name, defaultValue = "", options, placeholder = "Select...", accentColor = "#fde68a" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label ?? placeholder
    : placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const positionMenu = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
  }, []);

  useEffect(() => {
    if (open) positionMenu();
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    function handleScroll() { positionMenu(); }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", positionMenu);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", positionMenu);
    };
  }, [open, positionMenu]);

  function handleSelect(val: string) {
    setValue(val);
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input type="hidden" name={name} value={value} />

      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown" && !open) setOpen(true);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          background: open ? accentColor : "var(--surface)",
          border: "2px solid var(--fg)",
          borderRadius: "4px",
          padding: "8px 32px 8px 12px",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
          color: "var(--fg)",
          cursor: "pointer",
          textAlign: "left",
          display: "block",
          position: "relative",
          transition: "background 0.15s",
          lineHeight: "1.4",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = accentColor;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "var(--surface)";
        }}
      >
        {value ? (
          <span style={{ fontWeight: 500 }}>{selectedLabel}</span>
        ) : (
          <span style={{ color: "#888" }}>{placeholder}</span>
        )}
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)",
            transition: "transform 0.15s",
            lineHeight: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M4 5.5l3 3 3-3"
              stroke="#1a1a1a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && createPortal(
        <div
          style={menuStyle}
          role="listbox"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "2px solid var(--fg)",
              borderRadius: "4px",
              padding: "4px",
            }}
          >
            {options.map((opt, i) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    width: "100%",
                    display: "block",
                    padding: "8px 12px",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                    background: isSelected ? accentColor : "transparent",
                    color: "var(--fg)",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    lineHeight: "1.4",
                    fontWeight: isSelected ? 600 : 400,
                    marginBottom: i < options.length - 1 ? "2px" : 0,
                    transition: "background 0.12s, font-weight 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? accentColor : "transparent";
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
