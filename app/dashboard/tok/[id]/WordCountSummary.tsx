"use client";

import { useEffect, useState } from "react";

interface Props {
  initialJustifications: (string | null)[];
}

export default function WordCountSummary({ initialJustifications }: Props) {
  const [totalWords, setTotalWords] = useState(0);
  const TARGET = 950;

  useEffect(() => {
    const count = initialJustifications
      .filter(Boolean)
      .reduce((sum, j) => {
        const words = j!.trim() ? j!.trim().split(/\s+/).length : 0;
        return sum + words;
      }, 0);
    setTotalWords(count);
  }, [initialJustifications]);

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
