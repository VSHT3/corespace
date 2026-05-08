"use client";

import { useEffect, useRef, useState } from "react";

interface CheckItem {
  id: string;
  label: string;
  done: boolean;
}

interface Props {
  objectCount: number;
  justifiedCount: number;
  totalWords: number;
}

export default function SubmissionChecklist({ objectCount, justifiedCount, totalWords: initialWords }: Props) {
  const [open, setOpen] = useState(false);
  const [liveWords, setLiveWords] = useState(initialWords);
  const perSlot = useRef<Record<number, number>>({});

  useEffect(() => {
    const handler = (e: Event) => {
      const { slot, words } = (e as CustomEvent<{ slot: number; words: number }>).detail;
      perSlot.current = { ...perSlot.current, [slot]: words };
      setLiveWords(Object.values(perSlot.current).reduce((a, b) => a + b, 0));
    };
    window.addEventListener("justification-wordcount", handler);
    return () => window.removeEventListener("justification-wordcount", handler);
  }, []);

  const totalWords = liveWords;

  const items: CheckItem[] = [
    { id: "objects", label: "All 3 objects added", done: objectCount === 3 },
    { id: "justified", label: "All 3 objects justified", done: justifiedCount === 3 },
    { id: "wordcount", label: `Total word count 850+ (currently ${totalWords})`, done: totalWords >= 850 },
    { id: "types", label: "At least 2 different object types used", done: false }, // can't auto-check without type data
    { id: "personal", label: "At least 1 object with personal connection", done: false },
    { id: "kq", label: "Each justification includes a knowledge question", done: false },
    { id: "reviewed", label: "Justifications reviewed and not AI-copied verbatim", done: false },
    { id: "supervisor", label: "Shared draft with supervisor for feedback", done: false },
  ];

  const [manualChecked, setManualChecked] = useState<Record<string, boolean>>({});

  const autoChecked: Record<string, boolean> = {
    objects: objectCount === 3,
    justified: justifiedCount === 3,
    wordcount: totalWords >= 850,
  };

  const getChecked = (id: string) => {
    if (id in autoChecked) return autoChecked[id];
    return !!manualChecked[id];
  };

  const doneCount = items.filter((item) => getChecked(item.id)).length;
  const total = items.length;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto 1.5rem" }} className="no-print">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "11px", padding: "4px 12px" }}
      >
        {open ? "▲ Hide checklist" : `▼ Submission checklist (${doneCount}/${total})`}
      </button>

      {open && (
        <div
          style={{
            marginTop: "0.75rem",
            border: "2px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="eyebrow" style={{ margin: 0 }}>Before you submit</p>
            <span style={{ fontSize: "11px", fontWeight: 700, color: doneCount === total ? "#16a34a" : "#888" }}>
              {doneCount}/{total} complete
            </span>
          </div>
          <div>
            {items.map((item, i) => (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.6rem 1rem",
                  borderTop: i > 0 ? "1px solid #f0ebe0" : undefined,
                  cursor: item.id in autoChecked ? "default" : "pointer",
                  background: getChecked(item.id) ? "#f6fff9" : undefined,
                  transition: "background 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={getChecked(item.id)}
                  readOnly={item.id in autoChecked}
                  onChange={item.id in autoChecked ? undefined : (e) => setManualChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                  style={{ marginTop: "2px", flexShrink: 0, cursor: item.id in autoChecked ? "default" : "pointer" }}
                />
                <span style={{
                  fontSize: "13px",
                  color: getChecked(item.id) ? "#666" : "var(--fg)",
                  textDecoration: getChecked(item.id) ? "line-through" : "none",
                  lineHeight: 1.4,
                }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
          {doneCount === total && (
            <div style={{ padding: "0.75rem 1rem", background: "var(--mint)", borderTop: "2px solid var(--border)", fontSize: "13px", fontWeight: 700 }}>
              All done! Review your justifications one final time, then submit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
