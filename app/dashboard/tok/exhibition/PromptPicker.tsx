"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOK_PROMPTS, TOK_CATEGORIES, type TOKCategoryId } from "@/lib/tok-prompts";

const SEEN_KEY = "tok-prompt-tour-seen-v3";
const TOUR_DURATION_MS = 8500;
const MESSY_HEIGHT = 720;
const CARD_WIDTH_RANGE: [number, number] = [200, 280];

// Stable pseudo-random for each prompt
function rng(id: number, salt: number) {
  return ((id * 9301 + salt * 49297 + 1) % 233280) / 233280;
}

// Deterministic masonry-style packing for messy phase
function computeMessyLayout(containerW: number, allIds: number[]): Map<number, { x: number; y: number; w: number; rot: number }> {
  const map = new Map<number, { x: number; y: number; w: number; rot: number }>();
  // Use 4 columns for masonry-like staggered packing, with random vertical jitter
  const cols = Math.max(3, Math.floor(containerW / 260));
  const colW = containerW / cols;
  const colHeights = new Array(cols).fill(0);

  // Shuffle ids deterministically for varied distribution
  const shuffled = [...allIds].sort((a, b) => rng(a, 7) - rng(b, 7));

  for (const id of shuffled) {
    // Pick column with smallest current height (true masonry)
    let minCol = 0;
    for (let i = 1; i < cols; i++) if (colHeights[i] < colHeights[minCol]) minCol = i;

    const w = CARD_WIDTH_RANGE[0] + rng(id, 11) * (CARD_WIDTH_RANGE[1] - CARD_WIDTH_RANGE[0]);
    const cardH = 60 + rng(id, 13) * 80; // estimated height variation
    const xJitter = (rng(id, 17) - 0.5) * 30;
    const yJitter = (rng(id, 19) - 0.5) * 20;
    const rot = (rng(id, 23) - 0.5) * 12; // ±6°

    const x = minCol * colW + (colW - w) / 2 + xJitter;
    const y = colHeights[minCol] + yJitter;

    map.set(id, { x, y, w, rot });
    colHeights[minCol] += cardH + 20 + rng(id, 29) * 40; // varied gaps
  }

  return map;
}

// Sorted layout — 6 category columns
function computeSortedLayout(containerW: number): { perCategory: Map<TOKCategoryId, { x: number; w: number }>; cardsPerId: Map<number, { x: number; y: number; w: number }>; totalHeight: number } {
  const cols = TOK_CATEGORIES.length;
  const gap = 16;
  const colW = (containerW - gap * (cols - 1)) / cols;
  const headingOffset = 56; // space for category heading

  const perCategory = new Map<TOKCategoryId, { x: number; w: number }>();
  const cardsPerId = new Map<number, { x: number; y: number; w: number }>();

  let maxHeight = 0;

  TOK_CATEGORIES.forEach((cat, ci) => {
    const x = ci * (colW + gap);
    perCategory.set(cat.id, { x, w: colW });
    let yOffset = headingOffset;
    cat.promptIds.forEach((id) => {
      const cardH = 90; // estimated, doesn't need to be exact since flow positions y by accumulation
      cardsPerId.set(id, { x, y: yOffset, w: colW });
      yOffset += cardH + 8;
    });
    if (yOffset > maxHeight) maxHeight = yOffset;
  });

  return { perCategory, cardsPerId, totalHeight: maxHeight + 24 };
}

function smoothstep(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

// Phase mapping over t (0..1):
//  0.00–0.12 : hold messy
//  0.12–0.30 : descriptions fade in
//  0.30–0.50 : colorize, de-rotate
//  0.45–0.85 : flight to columns
//  0.85–1.00 : category headings fade in + filter pills
function phaseValues(t: number) {
  return {
    desc:    smoothstep((t - 0.12) / 0.18),
    color:   smoothstep((t - 0.30) / 0.20),
    derot:   smoothstep((t - 0.30) / 0.25),
    flight:  smoothstep((t - 0.45) / 0.40),
    headings: smoothstep((t - 0.85) / 0.15),
  };
}

export default function PromptPicker({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [t, setT] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [containerW, setContainerW] = useState(1200);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<TOKCategoryId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  // Track container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    setContainerW(containerRef.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const allIds = useMemo(() => Object.keys(TOK_PROMPTS).map(Number), []);
  const messyLayout = useMemo(() => computeMessyLayout(containerW, allIds), [containerW, allIds]);
  const sortedLayout = useMemo(() => computeSortedLayout(containerW), [containerW]);

  function runTour() {
    cancel();
    setDone(false);
    setT(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const v = Math.min(elapsed / TOUR_DURATION_MS, 1);
      setT(v);
      if (v < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        setDone(true);
        sessionStorage.setItem(SEEN_KEY, "1");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function cancel() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function skipTour() {
    cancel();
    setT(1);
    setDone(true);
    sessionStorage.setItem(SEEN_KEY, "1");
  }

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setSkipped(true);
      setT(1);
      setDone(true);
    } else {
      runTour();
    }
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ph = phaseValues(t);

  // Compute container height (interpolates between messy and sorted)
  const containerH = (1 - ph.flight) * MESSY_HEIGHT + ph.flight * sortedLayout.totalHeight;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "1rem", minHeight: "32px" }}>
        {!done && (
          <button onClick={skipTour} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            Skip tour →
          </button>
        )}
        {done && skipped && (
          <button onClick={() => { setSkipped(false); runTour(); }} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            ↻ Replay tour
          </button>
        )}
      </div>

      {/* Filter pills — appear at end of tour */}
      <motion.div
        animate={{ opacity: ph.headings, y: ph.headings > 0 ? 0 : -8 }}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", pointerEvents: ph.headings > 0.5 ? "auto" : "none", minHeight: "32px" }}
      >
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
          All ({allIds.length})
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
      </motion.div>

      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: containerH, transition: "height 0.3s ease" }}
      >
        {/* Category headings — appear at the end of the tour */}
        {TOK_CATEGORIES.map((cat) => {
          const colInfo = sortedLayout.perCategory.get(cat.id)!;
          const dimmed = activeCategory !== null && activeCategory !== cat.id;
          return (
            <motion.div
              key={`h-${cat.id}`}
              animate={{
                opacity: ph.headings * (dimmed ? 0.25 : 1),
                y: ph.headings > 0 ? 0 : -8,
              }}
              style={{
                position: "absolute",
                left: colInfo.x,
                top: 0,
                width: colInfo.w,
                pointerEvents: "none",
              }}
            >
              <h3
                className="heading"
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  paddingBottom: "0.4rem",
                  borderBottom: `3px solid ${cat.color}`,
                  marginBottom: 0,
                }}
              >
                {cat.label}
              </h3>
            </motion.div>
          );
        })}

        {/* Cards — single render, never unmount, animate from messy to sorted */}
        {allIds.map((id) => {
          const prompt = TOK_PROMPTS[id];
          const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id))!;
          const messy = messyLayout.get(id)!;
          const sorted = sortedLayout.cardsPerId.get(id)!;

          const x = (1 - ph.flight) * messy.x + ph.flight * sorted.x;
          const y = (1 - ph.flight) * messy.y + ph.flight * sorted.y;
          const w = (1 - ph.flight) * messy.w + ph.flight * sorted.w;
          const rot = messy.rot * (1 - ph.derot);
          const bg = lerpColor("#ffffff", resolveColor(cat.color), ph.color);

          const dimmed = done && activeCategory !== null && activeCategory !== cat.id;

          return (
            <motion.div
              key={id}
              layoutId={`prompt-${id}`}
              onClick={() => done && setExpandedId(id)}
              animate={{
                x,
                y,
                width: w,
                rotate: rot,
                backgroundColor: bg,
                opacity: dimmed ? 0.2 : 1,
                scale: 1,
              }}
              whileHover={done ? { scale: 1.03, zIndex: 10, boxShadow: "6px 6px 0 0 var(--fg)" } : undefined}
              transition={{ type: "tween", duration: 0, ease: "linear" }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                border: "2px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "0.85rem 1rem",
                cursor: done ? "pointer" : "default",
                transformOrigin: "center",
                willChange: "transform, width, background-color",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", minWidth: "16px", paddingTop: "1px" }}>{id}</span>
                <p style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.35 }}>{prompt.title}</p>
              </div>
              <div
                style={{
                  overflow: "hidden",
                  height: ph.desc < 0.05 ? 0 : "auto",
                  opacity: ph.desc,
                  marginTop: ph.desc > 0.05 ? "0.4rem" : 0,
                  transition: "height 0.3s ease, margin-top 0.3s ease",
                }}
              >
                <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, paddingLeft: "calc(16px + 0.5rem)" }}>
                  {prompt.description.length > 100 ? prompt.description.slice(0, 100) + "…" : prompt.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {expandedId !== null && (
          <ExpandedCard
            id={expandedId}
            onClose={() => setExpandedId(null)}
            createAction={createAction}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ExpandedCard({ id, onClose, createAction }: { id: number; onClose: () => void; createAction: (formData: FormData) => Promise<void> }) {
  const prompt = TOK_PROMPTS[id];
  const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id));
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function askAI(question: string) {
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are an IB Theory of Knowledge tutor. Help the student understand a TOK exhibition prompt — give a clear, concise (3-5 sentences) explanation focused on what the prompt is really asking, the key knowledge questions it raises, and what kinds of objects might work well.",
          prompt: `Prompt ${id}: "${prompt.title}"\n\nDescription: ${prompt.description}\n\nStudent question: ${question}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      setAiAnswer(data.text);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        layoutId={`prompt-${id}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: cat?.color ?? "var(--surface)",
          border: "2px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem 2.25rem",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "8px 8px 0 0 var(--fg)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", fontSize: "20px", fontWeight: 700, color: "var(--fg)" }}
          aria-label="Close"
        >
          ×
        </button>

        <p className="eyebrow" style={{ marginBottom: "0.4rem" }}>Prompt {id} · {cat?.label}</p>
        <h2 className="heading" style={{ fontSize: "22px", marginBottom: "1rem", lineHeight: 1.25 }}>{prompt.title}</h2>
        <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          {prompt.description}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: aiOpen ? "1.25rem" : 0 }}>
          <form action={createAction}>
            <input type="hidden" name="prompt_id" value={id} />
            <input type="hidden" name="title" value="My TOK Exhibition" />
            <button type="submit" className="btn-primary btn-primary-hover">
              Select this prompt →
            </button>
          </form>
          <button
            onClick={() => setAiOpen((v) => !v)}
            className="btn-ghost btn-ghost-hover"
          >
            {aiOpen ? "Hide AI" : "Ask AI about this"}
          </button>
        </div>

        <AnimatePresence>
          {aiOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ background: "rgba(255,255,255,0.7)", border: "2px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginTop: "0.5rem" }}>
                <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Ask AI</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <button onClick={() => askAI("What is this prompt really asking?")} disabled={aiLoading} className="tag" style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}>
                    What's it asking?
                  </button>
                  <button onClick={() => askAI("What kinds of objects would work well for this prompt? Give 3 example object types and why.")} disabled={aiLoading} className="tag" style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}>
                    Suggest objects
                  </button>
                  <button onClick={() => askAI("What are the key knowledge questions inside this prompt I should think about?")} disabled={aiLoading} className="tag" style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}>
                    Key KQs
                  </button>
                </div>
                {aiLoading && <p style={{ fontSize: "12px", color: "#555" }}>Thinking…</p>}
                {aiError && <p style={{ fontSize: "12px", color: "#c00" }}>{aiError}</p>}
                {aiAnswer && <p style={{ fontSize: "13px", color: "#222", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnswer}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Color helpers ───────────────────────────────────────────────
function resolveColor(c: string): string {
  if (c.startsWith("var(")) {
    const map: Record<string, string> = {
      "var(--yellow)": "#fde68a",
      "var(--pink)":   "#fbcfe8",
      "var(--mint)":   "#bbf7d0",
      "var(--sky)":    "#bae6fd",
    };
    return map[c] ?? c;
  }
  return c;
}

function lerpColor(aHex: string, bHex: string, t: number): string {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
