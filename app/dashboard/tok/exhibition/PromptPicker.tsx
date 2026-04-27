"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOK_PROMPTS, TOK_CATEGORIES, type TOKCategoryId } from "@/lib/tok-prompts";

type Phase = "messy" | "descriptions" | "colorize" | "sorted";

const SEEN_KEY = "tok-prompt-tour-seen-v1";

// Pre-computed random rotations + offsets for messy phase (deterministic per id)
const messyTransform = (id: number) => {
  // Pseudo-random but stable
  const seed = (id * 9301 + 49297) % 233280;
  const rot = ((seed / 233280) - 0.5) * 6; // ±3deg
  const xOff = (((id * 7919) % 100) - 50) * 0.4; // ±20px
  const yOff = (((id * 4337) % 100) - 50) * 0.3; // ±15px
  return { rot, xOff, yOff };
};

export default function PromptPicker({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [phase, setPhase] = useState<Phase>("messy");
  const [skip, setSkip] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function runTour() {
    clearTimers();
    setPhase("messy");
    timersRef.current.push(setTimeout(() => setPhase("descriptions"), 800));
    timersRef.current.push(setTimeout(() => setPhase("colorize"), 1800));
    timersRef.current.push(setTimeout(() => {
      setPhase("sorted");
      sessionStorage.setItem(SEEN_KEY, "1");
    }, 2800));
  }

  function skipTour() {
    clearTimers();
    setPhase("sorted");
    sessionStorage.setItem(SEEN_KEY, "1");
  }

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setSkip(true);
      setPhase("sorted");
    } else {
      runTour();
    }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDescriptions = phase !== "messy";
  const showColors = phase === "colorize" || phase === "sorted";
  const sorted = phase === "sorted";

  return (
    <>
      {/* Tour controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "1rem", minHeight: "32px" }}>
        {!sorted && (
          <button onClick={skipTour} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            Skip tour →
          </button>
        )}
        {sorted && skip && (
          <button onClick={() => { setSkip(false); runTour(); }} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            ↻ Replay tour
          </button>
        )}
      </div>

      {sorted ? (
        <SortedView createAction={createAction} />
      ) : (
        <MessyView phase={phase} showDescriptions={showDescriptions} showColors={showColors} />
      )}
    </>
  );
}

function MessyView({ phase, showDescriptions, showColors }: { phase: Phase; showDescriptions: boolean; showColors: boolean }) {
  const allIds = Object.keys(TOK_PROMPTS).map(Number);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", alignItems: "start" }}>
      {allIds.map((id) => {
        const prompt = TOK_PROMPTS[id];
        const category = TOK_CATEGORIES.find((c) => c.promptIds.includes(id));
        const { rot, xOff, yOff } = messyTransform(id);
        const messy = phase === "messy" || phase === "descriptions";

        return (
          <motion.div
            key={id}
            layout
            initial={false}
            animate={{
              rotate: messy ? rot : 0,
              x: messy ? xOff : 0,
              y: messy ? yOff : 0,
              backgroundColor: showColors && category ? category.color : "#ffffff",
            }}
            transition={{ type: "spring", stiffness: 80, damping: 18, mass: 0.8 }}
            style={{
              border: "2px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "0.85rem 1rem",
              cursor: "default",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#aaa", minWidth: "16px" }}>{id}</span>
              <p style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.35 }}>{prompt.title}</p>
            </div>
            <AnimatePresence>
              {showDescriptions && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: "11px", color: "#555", lineHeight: 1.5, paddingLeft: "calc(16px + 0.5rem)", overflow: "hidden" }}
                >
                  {prompt.description.length > 110 ? prompt.description.slice(0, 110) + "…" : prompt.description}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function SortedView({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [activeCategory, setActiveCategory] = useState<TOKCategoryId | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Category filter pills */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveCategory(null)}
          className="tag"
          style={{
            cursor: "pointer",
            background: activeCategory === null ? "var(--fg)" : "transparent",
            color: activeCategory === null ? "var(--bg)" : "var(--fg)",
            border: "2px solid var(--fg)",
          }}
        >
          All ({Object.keys(TOK_PROMPTS).length})
        </button>
        {TOK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className="tag"
            style={{
              cursor: "pointer",
              background: activeCategory === cat.id ? cat.color : "transparent",
              border: "2px solid var(--fg)",
            }}
          >
            {cat.label} ({cat.promptIds.length})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {TOK_CATEGORIES.filter((c) => activeCategory === null || c.id === activeCategory).map((cat) => (
          <motion.section
            key={cat.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3
              className="heading"
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.75rem",
                paddingBottom: "0.4rem",
                borderBottom: `3px solid ${cat.color}`,
              }}
            >
              {cat.label}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {cat.promptIds.map((id) => {
                const prompt = TOK_PROMPTS[id];
                return (
                  <form key={id} action={createAction}>
                    <input type="hidden" name="prompt_id" value={id} />
                    <input type="hidden" name="title" value="My TOK Exhibition" />
                    <motion.button
                      whileHover={{ x: -3, y: -3, boxShadow: "6px 6px 0 0 var(--fg)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      type="submit"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        padding: "0.75rem 0.9rem",
                        background: cat.color,
                        border: "2px solid var(--border)",
                        borderRadius: "var(--radius)",
                        display: "block",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.5)", minWidth: "16px", paddingTop: "1px" }}>{id}</span>
                        <p style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.35 }}>{prompt.title}</p>
                      </div>
                      <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, paddingLeft: "calc(16px + 0.5rem)" }}>
                        {prompt.description.length > 90 ? prompt.description.slice(0, 90) + "…" : prompt.description}
                      </p>
                    </motion.button>
                  </form>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
