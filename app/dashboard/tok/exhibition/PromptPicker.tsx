"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TOK_PROMPTS, TOK_CATEGORIES, type TOKCategoryId, type TOKPrompt } from "@/lib/tok-prompts";

const SEEN_KEY = "tok-prompt-tour-seen-v5";
const TOUR_DURATION_MS = 11000;
const CARD_WIDTH_RANGE: [number, number] = [200, 280];
const SORTED_CARD_GAP = 14;
const SORTED_CARD_HEIGHT = 166;
const PREVIEW_TOP_PADDING = 13.6;
const PREVIEW_BOTTOM_PADDING = 18;
const PREVIEW_TITLE_DESCRIPTION_GAP = 6.4;
const PREVIEW_DESCRIPTION_LINE_HEIGHT = 16.5;

// Stable pseudo-random for each prompt
function rng(id: number, salt: number) {
  return ((id * 9301 + salt * 49297 + 1) % 233280) / 233280;
}

// Deterministic masonry-style packing for messy phase
function computeMessyLayout(containerW: number, allIds: number[]): { positions: Map<number, { x: number; y: number; w: number; rot: number }>; totalHeight: number } {
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
    const cardH = 60 + rng(id, 13) * 30; // title-only cards ~60-90px
    const xJitter = (rng(id, 17) - 0.5) * 50;
    const yJitter = (rng(id, 19) - 0.5) * 20;
    const rot = (rng(id, 23) - 0.5) * 14; // ±7°

    const x = minCol * colW + (colW - w) / 2 + xJitter;
    const y = colHeights[minCol] + yJitter;

    map.set(id, { x, y, w, rot });
    colHeights[minCol] += cardH + 20 + rng(id, 29) * 30; // 20-50px gaps
  }

  return { positions: map, totalHeight: Math.max(...colHeights) + 80 };
}

// Sorted layout: 6 category columns. Uses fixed preview card height.
function computeSortedLayout(
  containerW: number,
  allIds: number[],
  fixedCardH: number
): { perCategory: Map<TOKCategoryId, { x: number; w: number }>; cardsPerId: Map<number, { x: number; y: number; w: number }>; totalHeight: number } {
  const cols = TOK_CATEGORIES.length;
  const gap = 16;
  const colW = (containerW - gap * (cols - 1)) / cols;

  const perCategory = new Map<TOKCategoryId, { x: number; w: number }>();
  const cardsPerId = new Map<number, { x: number; y: number; w: number }>();
  const visibleIds = new Set(allIds);

  let maxHeight = 0;

  TOK_CATEGORIES.forEach((cat, ci) => {
    const x = ci * (colW + gap);
    perCategory.set(cat.id, { x, w: colW });
    let yOffset = 0;
    cat.promptIds.filter((id) => visibleIds.has(id)).forEach((id) => {
      cardsPerId.set(id, { x, y: yOffset, w: colW });
      yOffset += fixedCardH + SORTED_CARD_GAP;
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

// Stronger ease-in-out (smootherstep / quintic): slow start + slow end, fast middle
function easeInOut(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function linear01(x: number) {
  return Math.max(0, Math.min(1, x));
}
// Aggressive springy easeInOut: quintic with steep middle, near-vertical acceleration
function springyIO(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Quintic ease in/out with strong midpoint
  return x < 0.5
    ? 16 * x * x * x * x * x
    : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

// Phase mapping over t (0..1) over 11s total:
//  0.00–0.18 : descriptions fade in (linear, fast)
//  0.18–0.36 : colorize + de-rotate
//  0.26–0.40 : equalize (springy resize)
//  0.44–0.66 : flight (springy, tiny delay after equalize)
//  0.50–0.72 : category headings
function phaseValues(t: number) {
  return {
    desc:     linear01(t / 0.18),
    color:    smoothstep((t - 0.18) / 0.18),
    derot:    smoothstep((t - 0.18) / 0.18),
    equalize: springyIO((t - 0.26) / 0.14),
    flight:   springyIO((t - 0.44) / 0.22),
    headings: smoothstep((t - 0.50) / 0.22),
  };
}

export default function PromptPicker({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [t, setT] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [containerW, setContainerW] = useState(1200);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<TOKCategoryId | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<TOKCategoryId | null>(null);
  const [hoveredPromptId, setHoveredPromptId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => { setMounted(true); }, []);

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
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchingPromptIds = useMemo(() => {
    if (!done || normalizedSearch === "") return new Set<number>();

    return new Set(allIds.filter((id) => {
      const prompt = TOK_PROMPTS[id];
      const category = TOK_CATEGORIES.find((cat) => cat.promptIds.includes(id));
      const haystack = [
        String(id),
        `prompt ${id}`,
        prompt.title,
        prompt.description,
        category?.label ?? "",
      ].join(" ").toLowerCase();

      return haystack.includes(normalizedSearch);
    }));
  }, [allIds, done, normalizedSearch]);
  const hasSearch = normalizedSearch !== "";
  const matchCount = matchingPromptIds.size;
  const messyLayoutFull = useMemo(() => computeMessyLayout(containerW, allIds), [containerW, allIds]);
  const messyLayout = messyLayoutFull.positions;
  const messyTotalHeight = messyLayoutFull.totalHeight;
  const sortedLayout = useMemo(() => computeSortedLayout(containerW, allIds, SORTED_CARD_HEIGHT), [containerW, allIds]);

  const equalW = useMemo(() => {
    const sortedColW = sortedLayout.perCategory.values().next().value?.w ?? 220;
    return sortedColW;
  }, [sortedLayout]);

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
        setSearchQuery("");
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

  useEffect(() => {
    if (activeCategory === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-category-control], [data-prompt-card]")) return;

      setActiveCategory(null);
      setHoveredCategory(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeCategory]);

  const ph = phaseValues(t);

  // Compute container height (interpolates between messy and sorted)
  const containerH = (1 - ph.flight) * messyTotalHeight + ph.flight * sortedLayout.totalHeight;

  const effectiveCategory = hoveredCategory ?? activeCategory;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem", minHeight: "44px", flexWrap: "wrap" }}>
        <div style={{ color: "#555", maxWidth: "560px" }}>
          <p style={{ margin: 0 }}>
            Pick one of the 35 official IB prompts. Let the tour sort them by theme, then choose the prompt that best fits your objects.
          </p>
          {done && skipped && (
            <button onClick={() => { setSkipped(false); setSearchQuery(""); runTour(); }} className="back-link" style={{ marginTop: "0.45rem", padding: 0, fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Replay tour
            </button>
          )}
        </div>
        {!done && (
          <button onClick={skipTour} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, flexShrink: 0 }}>
            Skip tour →
          </button>
        )}
        {done && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap", marginLeft: "auto" }}>
            <div style={{ position: "relative", width: "min(100vw - 3rem, 360px)" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search prompts"
                aria-label="Search prompts"
                style={{
                  width: "100%",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--surface)",
                  color: "var(--fg)",
                  padding: "0.65rem 2.65rem 0.65rem 0.8rem",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: "3px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    border: "none",
                    background: "transparent",
                    color: "var(--fg)",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  x
                </button>
              )}
            </div>
            {hasSearch && (
              <span style={{ color: "#555", fontSize: "12px", fontWeight: 700 }}>
                {matchCount} match{matchCount === 1 ? "" : "es"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category pills double as filter + heading: appear at end of tour */}
      <motion.div
        animate={{ opacity: ph.headings, y: ph.headings > 0 ? 0 : -8 }}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${TOK_CATEGORIES.length}, 1fr)`,
          gap: "16px",
          marginBottom: "1.25rem",
          pointerEvents: ph.headings > 0.5 ? "auto" : "none",
          minHeight: "44px",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {TOK_CATEGORIES.map((cat) => {
          const selected = activeCategory === cat.id;
          const active = effectiveCategory === cat.id;
          const dimmed = effectiveCategory !== null && !active;
          return (
            <button
              key={cat.id}
              data-category-control
              onClick={() => setActiveCategory(selected ? null : cat.id)}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onFocus={() => setHoveredCategory(cat.id)}
              onBlur={() => setHoveredCategory(null)}
              style={{
                cursor: "pointer",
                background: selected ? cat.color : "transparent",
                border: "2px solid var(--fg)",
                borderBottom: `5px solid ${cat.color}`,
                borderRadius: "var(--radius)",
                padding: "0.4rem 0.6rem 0.5rem",
                fontSize: "10.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                opacity: dimmed ? 0.5 : 1,
                lineHeight: 1.25,
                textAlign: "left",
                color: "var(--fg)",
                transition: "opacity 0.15s ease, background 0.15s ease",
              }}
            >
              <span style={{ display: "block" }}>{cat.label}</span>
              <span style={{ display: "block", fontSize: "9.5px", opacity: 0.55, marginTop: "2px" }}>{cat.promptIds.length} prompts</span>
            </button>
          );
        })}
      </motion.div>

      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: containerH, transition: "height 0.3s ease" }}
      >
        {/* Cards: single render, never unmount, animate from messy to sorted */}
        {allIds.map((id) => {
          const prompt = TOK_PROMPTS[id];
          const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id))!;
          const messy = messyLayout.get(id)!;
          const sorted = sortedLayout.cardsPerId.get(id)!;

          const x = (1 - ph.flight) * messy.x + ph.flight * sorted.x;
          const y = (1 - ph.flight) * messy.y + ph.flight * sorted.y;
          // Width: messy → equalize lerps to equalW, then flight stays at equalW (which equals sorted.w)
          const w = ph.flight > 0
            ? (1 - ph.flight) * equalW + ph.flight * sorted.w
            : (1 - ph.equalize) * messy.w + ph.equalize * equalW;
          const rot = messy.rot * (1 - ph.derot);
          const bg = lerpColor("#ffffff", resolveColor(cat.color), ph.color);

          const hovered = hoveredPromptId === id;
          const searchMatch = hasSearch && matchingPromptIds.has(id);
          const dimmed = done && (hasSearch ? !searchMatch : effectiveCategory !== null && effectiveCategory !== cat.id && !hovered);

          return (
            <motion.div
              key={id}
              animate={{
                x,
                y,
                width: w,
                rotate: rot,
                opacity: dimmed ? 0.2 : 1,
              }}
              transition={{
                x: { type: "tween", duration: 0, ease: "linear" },
                y: { type: "tween", duration: 0, ease: "linear" },
                width: { type: "tween", duration: 0, ease: "linear" },
                rotate: { type: "tween", duration: 0, ease: "linear" },
                opacity: { type: "tween", duration: 0.3, ease: "easeOut" },
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transformOrigin: "center",
                willChange: "transform, width",
                zIndex: searchMatch || hovered ? 2 : done ? 1 : 0,
              }}
            >
              <PromptPreviewCard
                id={id}
                prompt={prompt}
                bg={bg}
                done={done}
                phDesc={ph.desc}
                phEqualize={ph.equalize}
                onHover={setHoveredPromptId}
                onOpen={() => setExpandedId(id)}
              />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {mounted && expandedId !== null && (
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

function PromptPreviewCard({
  id,
  prompt,
  bg,
  done,
  phDesc,
  phEqualize,
  onHover,
  onOpen,
}: {
  id: number;
  prompt: TOKPrompt;
  bg: string;
  done: boolean;
  phDesc: number;
  phEqualize: number;
  onHover: (id: number | null) => void;
  onOpen: () => void;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const [descriptionLines, setDescriptionLines] = useState(0);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const updateLineCount = () => {
      const titleHeight = el.getBoundingClientRect().height;
      const availableHeight =
        SORTED_CARD_HEIGHT -
        PREVIEW_TOP_PADDING -
        PREVIEW_BOTTOM_PADDING -
        PREVIEW_TITLE_DESCRIPTION_GAP -
        titleHeight;

      setDescriptionLines(Math.max(0, Math.floor(availableHeight / PREVIEW_DESCRIPTION_LINE_HEIGHT)));
    };

    updateLineCount();
    const observer = new ResizeObserver(updateLineCount);
    observer.observe(el);
    return () => observer.disconnect();
  }, [prompt.title]);

  const descriptionHeight = descriptionLines * PREVIEW_DESCRIPTION_LINE_HEIGHT;

  return (
    <motion.div
      data-prompt-card
      layoutId={`prompt-${id}`}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => done && onOpen()}
      animate={{
        backgroundColor: bg,
      }}
      whileHover={done ? { x: -4, y: -4, boxShadow: "8px 8px 0 0 var(--fg)" } : undefined}
      transition={{
        backgroundColor: { type: "tween", duration: 0, ease: "linear" },
        x: { type: "spring", stiffness: 400, damping: 30 },
        y: { type: "spring", stiffness: 400, damping: 30 },
        boxShadow: { type: "spring", stiffness: 400, damping: 30 },
      }}
      style={{
        border: "2px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: `${PREVIEW_TOP_PADDING}px 1rem ${PREVIEW_BOTTOM_PADDING}px`,
        cursor: done ? "pointer" : "default",
        userSelect: "none",
        width: "100%",
        minHeight: phEqualize * SORTED_CARD_HEIGHT,
        height: done ? SORTED_CARD_HEIGHT : undefined,
        overflow: phEqualize > 0 ? "hidden" : undefined,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div ref={titleRef} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flexShrink: 0 }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", minWidth: "16px", paddingTop: "1px" }}>{id}</span>
        <p
          style={{
            fontWeight: 700,
            fontSize: "12px",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
            margin: 0,
          }}
        >
          {prompt.title}
        </p>
      </div>
      <div
        style={{
          overflow: "hidden",
          height: phDesc * descriptionHeight,
          opacity: phDesc,
          marginTop: descriptionLines > 0 ? `${phDesc * PREVIEW_TITLE_DESCRIPTION_GAP}px` : 0,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#444",
            lineHeight: `${PREVIEW_DESCRIPTION_LINE_HEIGHT}px`,
            paddingLeft: "calc(16px + 0.5rem)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: descriptionLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {prompt.description}
        </p>
      </div>
    </motion.div>
  );
}

function ExpandedCard({ id, onClose, createAction }: { id: number; onClose: () => void; createAction: (formData: FormData) => Promise<void> }) {
  const prompt = TOK_PROMPTS[id];
  const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id));
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function askAI(question: string) {
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are an IB Theory of Knowledge tutor. Help the student understand a TOK exhibition prompt. Give a clear, concise (3-5 sentences) explanation focused on what the prompt is really asking, the key knowledge questions it raises, and what kinds of objects might work well.",
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop layer: full-screen blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 199,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />
      {/* Modal positioning layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          pointerEvents: "auto",
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
    </>,
    document.body
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
