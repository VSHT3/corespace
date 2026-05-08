"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  initialJustifications: (string | null)[];
}

export default function WordCountSummary({ initialJustifications }: Props) {
  const [totalWords, setTotalWords] = useState(0);
  const TARGET = 950;
  const perSlot = useRef<Record<number, number>>({});

  useEffect(() => {
    const initial: Record<number, number> = {};
    initialJustifications.forEach((j, i) => {
      initial[i] = j?.trim() ? j.trim().split(/\s+/).length : 0;
    });
    perSlot.current = initial;
    setTotalWords(Object.values(initial).reduce((a, b) => a + b, 0));
  }, [initialJustifications]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { slot, words } = (e as CustomEvent<{ slot: number; words: number }>).detail;
      perSlot.current = { ...perSlot.current, [slot]: words };
      setTotalWords(Object.values(perSlot.current).reduce((a, b) => a + b, 0));
    };
    window.addEventListener("justification-wordcount", handler);
    return () => window.removeEventListener("justification-wordcount", handler);
  }, []);

  if (totalWords === 0) return null;

  const pct = Math.min(100, Math.round((totalWords / TARGET) * 100));
  const over = totalWords > TARGET;
  const color = over ? "#dc2626" : totalWords > TARGET * 0.85 ? "#b45309" : "#16a34a";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "80px", maxWidth: "120px", height: "6px", background: "#e5e5e5", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.3s ease" }} />
      </div>
      <span style={{ fontSize: "11px", color, fontWeight: 700 }}>
        {totalWords}/{TARGET} words
        {over && " (over limit)"}
      </span>
    </div>
  );
}
