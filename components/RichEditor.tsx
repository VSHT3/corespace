"use client";

import { useRef, useEffect, useCallback, useState } from "react";

function mdToHtml(md: string): string {
  if (!md) return "";
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .split("\n")
    .map((line) => `<div>${line || "<br>"}</div>`)
    .join("");
}

function htmlToMd(html: string): string {
  let text = html
    .replace(/<div><br><\/div>/gi, "\n")
    .replace(/<div>(.*?)<\/div>/gi, (_, c) => {
      const t = c.trim();
      return t ? t + "\n" : "\n";
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  style?: React.CSSProperties;
  editorId?: string;
  spellcheck?: boolean;
}

export default function RichEditor({
  value,
  onChange,
  onBlur,
  placeholder = "",
  minHeight = "180px",
  className = "",
  style = {},
  editorId,
  spellcheck = true,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef(value);

  // Sync external value changes (AI generation) → innerHTML
  useEffect(() => {
    if (!ref.current) return;
    const md = htmlToMd(ref.current.innerHTML);
    if (value !== lastEmittedRef.current && value !== md) {
      ref.current.innerHTML = mdToHtml(value);
      lastEmittedRef.current = value;
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  // Init innerHTML on first mount
  useEffect(() => {
    if (!ref.current) return;
    if (!ref.current.innerHTML) {
      ref.current.innerHTML = mdToHtml(value);
    }
  }, []);

  function handleInput() {
    if (!ref.current) return;
    const md = htmlToMd(ref.current.innerHTML);
    lastEmittedRef.current = md;
    onChange(md);
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      document.execCommand("bold");
      handleInput();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
      e.preventDefault();
      document.execCommand("italic");
      handleInput();
      return;
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }

  const isEmpty = !ref.current?.innerText?.trim() && !value;

  return (
    <div style={{ position: "relative", width: "100%", minHeight }}>
      {isEmpty && placeholder && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "12px",
            fontSize: "14px",
            color: "#aaa",
            pointerEvents: "none",
            fontFamily: "inherit",
            lineHeight: "1.6",
          }}
        >
          {placeholder}
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        id={editorId}
        data-editor="true"
        spellCheck={spellcheck}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (!ref.current) return;
          const md = htmlToMd(ref.current.innerHTML);
          lastEmittedRef.current = md;
          onChange(md);
          onBlur?.();
        }}
        className={className}
        style={{
          width: "100%",
          minHeight,
          background: "var(--surface)",
          border: "2px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "8px 12px",
          fontSize: "14px",
          color: "var(--fg)",
          outline: "none",
          boxShadow: "none",
          resize: "none",
          overflow: "hidden",
          lineHeight: "1.6",
          fontFamily: "var(--font-sans)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          cursor: "text",
          boxSizing: "border-box",
          ...style,
        }}
      />
    </div>
  );
}
