"use client";

import { useEffect, useState, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { TOK_PROMPTS, TOK_CATEGORIES, type TOKCategoryId, type TOKPrompt } from "@/lib/tok-prompts";

// Session-persistent chat history keyed by prompt ID
type ChatMessage = { role: "user" | "ai"; text: string; id: number };
const sessionChat = new Map<number, ChatMessage[]>();
let msgIdCounter = 0;

const SEEN_KEY = "tok-prompt-tour-seen-v6";

// ─── Tour timing (seconds) ────────────────────────────────────────────
const T_SPAWN_FIRST = 0.35;        // Delay of the first card
const T_SPAWN_LAST = 4.2;          // Delay of the last card (35th)
const T_SETTLE = T_SPAWN_LAST + 0.55;
const T_UNIFY_START = T_SETTLE + 0.1;
const T_UNIFY_DURATION = 1.8;      // Slower color + unify
const T_FLIGHT_START = T_UNIFY_START + T_UNIFY_DURATION - 0.35; // Movement starts a bit before unify finishes
const FLIGHT_PER_CARD_STAGGER = 0.018;
const T_HEADINGS_DELAY = 0.55;     // Headings appear shortly after flight
const T_HEADINGS_DURATION = 0.9;   // Headings reveal duration
const T_FLIGHT_SETTLE_PADDING = 1.8; // Wait for spring overshoot to finish before ripple
const T_RIPPLE_START_OFFSET = T_HEADINGS_DELAY + T_HEADINGS_DURATION + T_FLIGHT_SETTLE_PADDING;
const T_RIPPLE_DURATION = 6.0;     // Total ripple window
const RIPPLE_PER_STEP = 0.22;      // 220ms per Manhattan step

const SORTED_CARD_HEIGHT = 166;
const SORTED_CARD_GAP = 14;
const PREVIEW_TOP_PADDING = 13.6;
const PREVIEW_BOTTOM_PADDING = 18;
const PREVIEW_TITLE_DESCRIPTION_GAP = 6.4;
const PREVIEW_DESCRIPTION_LINE_HEIGHT = 16.5;

// Stable pseudo-random per (id, salt)
function rng(id: number, salt: number) {
  return ((id * 9301 + salt * 49297 + 1) % 233280) / 233280;
}

// Spawn delay for the i-th card (0-indexed). Gaps start large, shrink toward
// zero — first few cards have visibly slow cadence, later cards rapid-fire.
// Use sqrt(u): derivative 1/(2*sqrt(u)) is huge near 0, small near 1, so
// inter-card gaps are big at the start and tiny at the end.
function spawnDelay(i: number, total: number): number {
  if (total <= 1) return T_SPAWN_FIRST;
  const u = i / (total - 1);
  const eased = Math.sqrt(u);
  return T_SPAWN_FIRST + eased * (T_SPAWN_LAST - T_SPAWN_FIRST);
}

// Scattered layout: messy positions across the full container width AND the
// full eventual sorted height (so cards spread out, do not stack).
type ScatterPos = {
  x: number; y: number; w: number; rot: number;
  floatDX: number; floatDY: number; floatPeriod: number; floatPhase: number;
};
function computeScatter(containerW: number, containerH: number, allIds: number[]): Map<number, ScatterPos> {
  const map = new Map<number, ScatterPos>();
  if (containerW === 0 || containerH === 0) {
    for (const id of allIds) map.set(id, { x: 0, y: 0, w: 240, rot: 0, floatDX: 0, floatDY: 0, floatPeriod: 3, floatPhase: 0 });
    return map;
  }
  const cardW = 240;
  const cardH = 70;
  const padX = 4;
  const padY = 4;
  const minX = padX;
  const maxX = Math.max(padX, containerW - cardW - padX);
  const minY = padY;
  const maxY = Math.max(padY + 20, containerH - cardH - padY);

  const total = allIds.length;
  const aspect = (maxX - minX) / Math.max(1, maxY - minY);
  const cols = Math.max(1, Math.round(Math.sqrt(total * aspect)));
  const rows = Math.max(1, Math.ceil(total / cols));
  const cellW = (maxX - minX) / cols;
  const cellH = (maxY - minY) / rows;

  const cellOrder = [...Array(cols * rows).keys()];
  cellOrder.sort((a, b) => rng(a, 41) - rng(b, 41));

  allIds.forEach((id, idx) => {
    const cellIdx = cellOrder[idx % cellOrder.length];
    const cx = cellIdx % cols;
    const cy = Math.floor(cellIdx / cols);
    // Heavy jitter within cell (0.95) plus slight neighbor-bleed for chaos
    const jitterX = (rng(id, 17) - 0.5) * cellW * 0.95;
    const jitterY = (rng(id, 19) - 0.5) * cellH * 0.95;
    const rawX = minX + cx * cellW + (cellW - cardW) / 2 + jitterX;
    const rawY = minY + cy * cellH + (cellH - cardH) / 2 + jitterY;
    const x = Math.max(minX, Math.min(maxX, rawX));
    const y = Math.max(minY, Math.min(maxY, rawY));
    const rot = (rng(id, 23) - 0.5) * 28; // ±14° — more unhinged

    // Float in a unique direction per card via random angle + magnitude
    const angle = rng(id, 31) * Math.PI * 2;
    const mag = 4 + rng(id, 33) * 8; // 4–12 px
    const floatDX = Math.cos(angle) * mag;
    const floatDY = Math.sin(angle) * mag;
    const floatPeriod = 2.6 + rng(id, 37) * 2.4; // 2.6–5.0s
    const floatPhase = rng(id, 39) * 1; // 0–1s offset so they desync

    map.set(id, { x, y, w: cardW, rot, floatDX, floatDY, floatPeriod, floatPhase });
  });

  return map;
}

// Sorted layout: 6 category columns, fixed card height
function computeSortedLayout(
  containerW: number,
  allIds: number[],
  fixedCardH: number
): { cardsPerId: Map<number, { x: number; y: number; w: number; col: number; row: number }>; totalHeight: number; firstColW: number } {
  const cols = TOK_CATEGORIES.length;
  const gap = 16;
  const colW = (containerW - gap * (cols - 1)) / cols;
  const cardsPerId = new Map<number, { x: number; y: number; w: number; col: number; row: number }>();
  const visibleIds = new Set(allIds);

  let maxHeight = 0;
  TOK_CATEGORIES.forEach((cat, ci) => {
    const x = ci * (colW + gap);
    let yOffset = 0;
    let row = 0;
    cat.promptIds.filter((id) => visibleIds.has(id)).forEach((id) => {
      cardsPerId.set(id, { x, y: yOffset, w: colW, col: ci, row });
      yOffset += fixedCardH + SORTED_CARD_GAP;
      row += 1;
    });
    if (yOffset > maxHeight) maxHeight = yOffset;
  });

  return { cardsPerId, totalHeight: maxHeight + 24, firstColW: colW };
}

// ─── Phase enum ───────────────────────────────────────────────────────
type Phase = "spawn" | "settle" | "unify" | "flight" | "ripple" | "done";

export default function PromptPicker({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const reduce = useReducedMotion();
  // Compute initial tour state synchronously so the first render matches the
  // final layout when the tour was already seen (or reduced motion is on).
  // This prevents the spawn animation + delayed clamp measurement from
  // causing description overflow on refresh / revisit.
  const initialSkip = typeof window !== "undefined" && (sessionStorage.getItem(SEEN_KEY) !== null || !!reduce);
  const [phase, setPhase] = useState<Phase>(initialSkip ? "done" : "spawn");
  const [headingsShown, setHeadingsShown] = useState(initialSkip);
  const [tourKey, setTourKey] = useState(0);
  const [skipped, setSkipped] = useState(initialSkip);
  const [containerW, setContainerW] = useState(1200);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<TOKCategoryId | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<TOKCategoryId | null>(null);
  const [hoveredPromptId, setHoveredPromptId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // `done` = full sequence (incl. ripple) finished — gates card click + keyboard.
  // `uiShown` = top toolbar (search, filters, replay) — appears with the column
  // headings, before the ripple so the page feels assembled in one beat.
  const done = phase === "done";
  const uiShown = headingsShown;

  const allIds = useMemo(() => Object.keys(TOK_PROMPTS).map(Number), []);

  function surpriseMe() {
    const pool = allIds.filter((id) => {
      const level = TOK_PROMPTS[id].difficulty;
      const diffOk = difficultyFilter === "easy" ? level <= 2 : difficultyFilter === "medium" ? level === 3 : difficultyFilter === "hard" ? level >= 4 : true;
      const catOk = activeCategory === null ? true : (TOK_CATEGORIES.find((cat) => cat.id === activeCategory)?.promptIds.includes(id) ?? false);
      return diffOk && catOk;
    });
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setExpandedId(pick);
  }

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

  const sortedLayout = useMemo(() => computeSortedLayout(containerW, allIds, SORTED_CARD_HEIGHT), [containerW, allIds]);
  const [viewportH, setViewportH] = useState(800);
  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // Constrain scatter zone to roughly above-the-fold: don't overflow viewport.
  // Subtract ~280px for navbar + page header + category placeholder.
  const scatterZoneH = Math.min(sortedLayout.totalHeight, Math.max(420, viewportH - 280));
  const scatterMap = useMemo(
    () => computeScatter(containerW, scatterZoneH, allIds),
    [containerW, scatterZoneH, allIds],
  );

  // Tour orchestration: schedule phase transitions
  const runTour = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setHeadingsShown(false);
    setTourKey((k) => k + 1);
    setPhase("spawn");

    const at = (sec: number, fn: () => void) => {
      timeoutsRef.current.push(setTimeout(fn, sec * 1000));
    };
    at(T_SETTLE, () => setPhase("settle"));
    at(T_UNIFY_START, () => setPhase("unify"));
    at(T_FLIGHT_START, () => setPhase("flight"));
    at(T_FLIGHT_START + T_HEADINGS_DELAY, () => setHeadingsShown(true));
    at(T_FLIGHT_START + T_RIPPLE_START_OFFSET, () => setPhase("ripple"));
    at(T_FLIGHT_START + T_RIPPLE_START_OFFSET + T_RIPPLE_DURATION, () => {
      setPhase("done");
      sessionStorage.setItem(SEEN_KEY, "1");
    });
  }, []);

  function skipTour() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setHeadingsShown(true);
    setPhase("done");
    sessionStorage.setItem(SEEN_KEY, "1");
  }

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY) || reduce) {
      setSkipped(true);
      setHeadingsShown(true);
      setPhase("done");
    } else {
      runTour();
    }
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [reduce, runTour]);

  // Keyboard shortcuts when tour is done
  useEffect(() => {
    if (!done) return;
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") {
          setSearchQuery("");
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "r" || e.key === "R") {
        surpriseMe();
      }
      if (e.key === "Escape") {
        setActiveCategory(null);
        setSearchQuery("");
        setDifficultyFilter("all");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, difficultyFilter, activeCategory]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchingPromptIds = useMemo(() => {
    if (!done) return new Set<number>();
    const diffMatch = (id: number) => {
      const level = TOK_PROMPTS[id].difficulty;
      if (difficultyFilter === "easy") return level <= 2;
      if (difficultyFilter === "medium") return level === 3;
      if (difficultyFilter === "hard") return level >= 4;
      return true;
    };
    const catMatch = (id: number) => {
      if (activeCategory === null) return true;
      return TOK_CATEGORIES.find((cat) => cat.id === activeCategory)?.promptIds.includes(id) ?? false;
    };
    if (normalizedSearch === "" && difficultyFilter === "all" && activeCategory === null) return new Set<number>();
    return new Set(allIds.filter((id) => {
      if (!diffMatch(id)) return false;
      if (!catMatch(id)) return false;
      if (normalizedSearch === "") return true;
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
  }, [allIds, done, normalizedSearch, difficultyFilter, activeCategory]);

  const hasSearch = normalizedSearch !== "";
  const hasFilter = hasSearch || difficultyFilter !== "all" || activeCategory !== null;
  const matchCount = matchingPromptIds.size;

  // Container height: scatter uses sortedLayout.totalHeight too, so always that
  const containerH = sortedLayout.totalHeight;

  const effectiveCategory = hoveredCategory ?? activeCategory;

  const headingsVisible = headingsShown;

  // Pre-compute spawn order index per id
  const spawnIndex = useMemo(() => {
    const m = new Map<number, number>();
    // Random but deterministic spawn order
    const order = [...allIds].sort((a, b) => rng(a, 53) - rng(b, 53));
    order.forEach((id, i) => m.set(id, i));
    return m;
  }, [allIds]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem", minHeight: "44px", flexWrap: "wrap" }}>
        <div style={{ color: "#555", maxWidth: "560px" }}>
          <p style={{ margin: 0 }}>
            Pick one of the 35 official IB prompts. Let the tour sort them by theme, then choose the prompt that best fits your objects.
          </p>
          {uiShown && (
            <button onClick={() => { setSkipped(false); setSearchQuery(""); setActiveCategory(null); setDifficultyFilter("all"); runTour(); }} className="back-link" style={{ marginTop: "0.45rem", padding: 0, fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              ↻ Replay tour
            </button>
          )}
        </div>
        {!uiShown && (
          <button onClick={skipTour} className="back-link" style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, flexShrink: 0 }}>
            Skip tour →
          </button>
        )}
      </div>

      {/* Combined toolbar: kbd hints (left) + search/filter/surprise (right). */}
      {uiShown && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: T_HEADINGS_DURATION, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "0.85rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { key: "/", label: "focus search" },
              { key: "r", label: "random prompt" },
              { key: "Esc", label: "clear filters" },
            ].map(({ key, label }) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#aaa" }}>
                <kbd style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", padding: "1px 5px", color: "#555", lineHeight: 1.6 }}>{key}</kbd>
                <span>{label}</span>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginLeft: "auto" }}>
            <div style={{ position: "relative", width: "min(100vw - 3rem, 280px)" }}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search prompts  (/)"
                aria-label="Search prompts"
                style={{
                  width: "100%",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--surface)",
                  color: "var(--fg)",
                  padding: "0.5rem 2.4rem 0.5rem 0.7rem",
                  fontSize: "13px",
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
                    width: "32px",
                    height: "32px",
                    border: "none",
                    background: "transparent",
                    color: "var(--fg)",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  x
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              {(["all", "easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(difficultyFilter === level ? "all" : level)}
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    padding: "5px 8px",
                    border: "2px solid var(--fg)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    background: difficultyFilter === level ? "var(--fg)" : "transparent",
                    color: difficultyFilter === level ? "var(--bg)" : "var(--fg)",
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  {level === "all" ? "All" : level === "easy" ? "Easy" : level === "medium" ? "Med" : "Hard"}
                </button>
              ))}
            </div>
            <button
              onClick={surpriseMe}
              className="btn-ghost btn-ghost-hover"
              style={{ fontSize: "11px", padding: "5px 10px", flexShrink: 0 }}
              title="Open a random prompt"
            >
              Surprise me
            </button>
            {hasFilter && (
              <span style={{ color: "#555", fontSize: "12px", fontWeight: 700, flexBasis: "100%", textAlign: "right" }}>
                {matchCount} match{matchCount === 1 ? "" : "es"}
                {activeCategory !== null && normalizedSearch === "" && difficultyFilter === "all" && (
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{ marginLeft: "6px", fontSize: "10px", background: "none", border: "none", cursor: "pointer", color: "#888", textDecoration: "underline" }}
                  >
                    clear
                  </button>
                )}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Category headings */}
      <motion.div
        animate={{ opacity: headingsVisible ? 1 : 0, y: headingsVisible ? 0 : -8 }}
        transition={{ duration: T_HEADINGS_DURATION, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${TOK_CATEGORIES.length}, 1fr)`,
          gap: "16px",
          marginBottom: "1.25rem",
          pointerEvents: headingsVisible ? "auto" : "none",
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
        {allIds.map((id) => {
          const prompt = TOK_PROMPTS[id];
          const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id))!;
          const scatter = scatterMap.get(id)!;
          const sorted = sortedLayout.cardsPerId.get(id)!;

          const hovered = hoveredPromptId === id;
          const filterMatch = hasFilter && matchingPromptIds.has(id);
          const dimmed = done && (hasFilter ? !filterMatch : effectiveCategory !== null && effectiveCategory !== cat.id && !hovered);

          const idx = spawnIndex.get(id) ?? 0;
          const spawnAt = spawnDelay(idx, allIds.length);

          // Manhattan ripple delay (col + row from top-left, sorted grid)
          const rippleDelay = (sorted.col + sorted.row) * RIPPLE_PER_STEP;

          return (
            <PromptCardOrchestrator
              key={`${tourKey}-${id}`}
              id={id}
              prompt={prompt}
              cat={cat}
              scatter={scatter}
              sorted={sorted}
              phase={phase}
              spawnAt={spawnAt}
              rippleDelay={rippleDelay}
              flightStagger={idx * FLIGHT_PER_CARD_STAGGER}
              dimmed={!!dimmed}
              done={done}
              filterMatch={filterMatch}
              hovered={hovered}
              onHover={setHoveredPromptId}
              onOpen={() => setExpandedId(id)}
              reduce={!!reduce}
              skipAnimation={skipped}
            />
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

// ─── Card orchestrator ───────────────────────────────────────────────
function PromptCardOrchestrator({
  id,
  prompt,
  cat,
  scatter,
  sorted,
  phase,
  spawnAt,
  rippleDelay,
  flightStagger,
  dimmed,
  done,
  filterMatch,
  hovered,
  onHover,
  onOpen,
  reduce,
  skipAnimation,
}: {
  id: number;
  prompt: TOKPrompt;
  cat: { id: TOKCategoryId; label: string; color: string; promptIds: number[] };
  scatter: { x: number; y: number; w: number; rot: number; floatDX: number; floatDY: number; floatPeriod: number; floatPhase: number };
  sorted: { x: number; y: number; w: number; col: number; row: number };
  phase: Phase;
  spawnAt: number;
  rippleDelay: number;
  flightStagger: number;
  dimmed: boolean;
  done: boolean;
  filterMatch: boolean;
  hovered: boolean;
  onHover: (id: number | null) => void;
  onOpen: () => void;
  reduce: boolean;
  skipAnimation: boolean;
}) {
  // Determine target position/size/rotation by phase
  const inFlightOrLater = phase === "flight" || phase === "ripple" || phase === "done";
  const inUnifyOrLater = phase === "unify" || inFlightOrLater;
  const inSpawnOrSettle = phase === "spawn" || phase === "settle";

  const targetX = inFlightOrLater ? sorted.x : scatter.x;
  const targetY = inFlightOrLater ? sorted.y : scatter.y;
  const targetW = inUnifyOrLater ? sorted.w : scatter.w;
  const targetRot = inUnifyOrLater ? 0 : scatter.rot;

  // Color: starts white, gains category color during unify
  const catColor = resolveColor(cat.color);
  const targetBg = inUnifyOrLater ? catColor : "#ffffff";

  // Phase progress flags for child
  const showDescription = inUnifyOrLater;
  const showRipple = phase === "ripple" || phase === "done";

  // Floating: only during spawn phase, and only after this card has spawned
  // Implemented by varying x/y around target with relative motion via parent.
  // Easiest: use an inner motion.div for float (continuous), outer for layout transition.

  const positionTransition = inFlightOrLater
    ? {
        // Slower, very bouncy spring per-card with stagger
        x: { type: "spring" as const, stiffness: 110, damping: 8, mass: 1.2, delay: flightStagger },
        y: { type: "spring" as const, stiffness: 110, damping: 8, mass: 1.2, delay: flightStagger },
        width: { type: "spring" as const, stiffness: 140, damping: 16, mass: 1.0, delay: flightStagger },
        rotate: { type: "tween" as const, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      }
    : phase === "unify"
    ? {
        x: { duration: 0 },
        y: { duration: 0 },
        width: { type: "spring" as const, stiffness: 110, damping: 22, mass: 1 },
        rotate: { type: "tween" as const, duration: 1.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      }
    : {
        x: { duration: 0 },
        y: { duration: 0 },
        width: { duration: 0 },
        rotate: { duration: 0 },
      };

  // Spawn entrance: hidden until delay fires, then pop in (scale + opacity).
  // On refresh / revisit (skipAnimation), bypass entirely so the card mounts
  // at its final state — no spawn, no measurement lag.
  const noAnim = reduce || skipAnimation;
  const spawnInitial = noAnim
    ? { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.4 };
  const spawnAnimate = { opacity: 1, scale: 1 };

  return (
    <motion.div
      initial={spawnInitial}
      animate={spawnAnimate}
      transition={{
        opacity: { duration: 0.22, delay: noAnim ? 0 : spawnAt, ease: [0.16, 1, 0.3, 1] },
        scale: noAnim
          ? { duration: 0 }
          : { type: "spring", stiffness: 320, damping: 14, mass: 0.7, delay: spawnAt },
      }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: filterMatch || hovered ? 3 : done ? 1 : 2,
        pointerEvents: done ? "auto" : "none",
      }}
    >
      <motion.div
        animate={{
          x: targetX,
          y: targetY,
          width: targetW,
          rotate: targetRot,
        }}
        transition={positionTransition}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "center",
          willChange: "transform, width",
        }}
      >
        {/* Float layer: only animates during spawn/settle, then locks at 0 */}
        <motion.div
          animate={
            inSpawnOrSettle && !reduce
              ? {
                  x: [0, scatter.floatDX, -scatter.floatDX * 0.6, scatter.floatDX * 0.3, 0],
                  y: [0, scatter.floatDY, -scatter.floatDY * 0.6, scatter.floatDY * 0.3, 0],
                }
              : { x: 0, y: 0 }
          }
          transition={
            inSpawnOrSettle && !reduce
              ? { duration: scatter.floatPeriod, repeat: Infinity, ease: "easeInOut", delay: scatter.floatPhase }
              : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <PromptPreviewCard
            id={id}
            prompt={prompt}
            bg={targetBg}
            done={done}
            showDescription={showDescription}
            unified={inUnifyOrLater}
            showRipple={showRipple}
            rippleDelay={rippleDelay}
            dimmed={dimmed}
            onHover={onHover}
            onOpen={onOpen}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function PromptPreviewCard({
  id,
  prompt,
  bg,
  done,
  showDescription,
  unified,
  showRipple,
  rippleDelay,
  dimmed,
  onHover,
  onOpen,
}: {
  id: number;
  prompt: TOKPrompt;
  bg: string;
  done: boolean;
  showDescription: boolean;
  unified: boolean;
  showRipple: boolean;
  rippleDelay: number;
  dimmed: boolean;
  onHover: (id: number | null) => void;
  onOpen: () => void;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const [descriptionLines, setDescriptionLines] = useState(1);

  // Measure synchronously before paint so the line clamp matches the card on
  // the very first frame (no overflow flash on the no-tour refresh path).
  useLayoutEffect(() => {
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

      setDescriptionLines(Math.max(1, Math.floor(availableHeight / PREVIEW_DESCRIPTION_LINE_HEIGHT)));
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
      animate={showRipple
        ? {
            backgroundColor: bg,
            opacity: dimmed ? 0.2 : 1,
            scale: [1, 1.05, 0.985, 1],
          }
        : {
            backgroundColor: bg,
            opacity: dimmed ? 0.2 : 1,
            scale: 1,
          }}
      whileHover={done ? { x: -4, y: -4, boxShadow: "8px 8px 0 0 var(--fg)" } : undefined}
      transition={{
        backgroundColor: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3, ease: "easeOut" },
        scale: showRipple
          ? { duration: 0.42, times: [0, 0.35, 0.7, 1], delay: rippleDelay, ease: [0.16, 1, 0.3, 1] }
          : { duration: 0 },
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
        height: unified ? SORTED_CARD_HEIGHT : undefined,
        minHeight: unified ? undefined : 60,
        overflow: unified ? "hidden" : undefined,
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
            flex: 1,
          }}
        >
          {prompt.title}
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.3 }}
          animate={showRipple ? "show" : "hide"}
          variants={{
            hide: { opacity: 0, scale: 0.3, transition: { duration: 0.15 } },
            show: {
              opacity: 1,
              scale: 1,
              transition: {
                opacity: { duration: 0.32, delay: rippleDelay, ease: [0.16, 1, 0.3, 1] },
                scale: { type: "spring", stiffness: 320, damping: 14, mass: 0.7, delay: rippleDelay },
              },
            },
          }}
          style={{ flexShrink: 0, paddingTop: "1px", display: "inline-flex" }}
        >
          <DifficultyDots level={prompt.difficulty} size={6} gap={2} />
        </motion.span>
      </div>
      <motion.div
        initial={false}
        animate={{
          height: showDescription ? descriptionHeight : 0,
          opacity: showDescription ? 1 : 0,
          marginTop: showDescription && descriptionLines > 0 ? PREVIEW_TITLE_DESCRIPTION_GAP : 0,
        }}
        transition={{
          height: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
          marginTop: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
        }}
        style={{ overflow: "hidden", flexShrink: 0 }}
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
      </motion.div>
    </motion.div>
  );
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const CHIPS = [
  { label: "What's it really asking?", question: "What is this prompt really asking? Be specific about the core knowledge question." },
  { label: "Suggest 3 objects", question: "What kinds of objects would work well for this prompt? Give 3 concrete example objects and a one-sentence reason for each." },
  { label: "Key knowledge questions", question: "What are the key knowledge questions inside this prompt I should think about for my exhibition?" },
];

function ExpandedCard({ id, onClose, createAction }: { id: number; onClose: () => void; createAction: (formData: FormData) => Promise<void> }) {
  const prompt = TOK_PROMPTS[id];
  const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id));

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => sessionChat.get(id) ?? []);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [titleValue, setTitleValue] = useState("My TOK Exhibition");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionChat.set(id, messages);
  }, [id, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 380);
    }
  }, [chatOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (chatOpen) setChatOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, chatOpen]);

  async function sendMessage(question: string) {
    if (!question.trim() || aiLoading) return;
    setAiError("");
    const userMsg: ChatMessage = { role: "user", text: question.trim(), id: ++msgIdCounter };
    const currentHistory = messages.map((m) => ({ role: m.role === "user" ? "user" as const : "model" as const, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "prompt_explainer",
          userMessage: question.trim(),
          history: currentHistory,
          context: {
            promptId: String(id),
            promptTitle: prompt.title,
            promptDescription: prompt.description,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      const aiMsg: ChatMessage = { role: "ai", text: data.text, id: ++msgIdCounter };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Request failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  if (typeof document === "undefined") return null;

  const catColor = cat?.color ?? "var(--surface)";

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={() => { if (chatOpen) setChatOpen(false); else onClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={() => { if (chatOpen) setChatOpen(false); else onClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "2rem",
          pointerEvents: "auto",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            maxWidth: chatOpen ? "1060px" : "640px",
            alignItems: "stretch",
            transition: `max-width 380ms cubic-bezier(${EASE_OUT_EXPO.join(",")})`,
          }}
        >
          <motion.div
            layoutId={`prompt-${id}`}
            style={{
              background: catColor,
              border: "2px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "2rem 2.25rem",
              boxShadow: "8px 8px 0 0 var(--fg)",
              position: "relative",
              overflowY: "auto",
              maxHeight: "85vh",
              flex: chatOpen ? "0 0 52%" : "1 1 100%",
              minWidth: 0,
              transition: `flex 380ms cubic-bezier(${EASE_OUT_EXPO.join(",")})`,
            }}
          >
            <button
              onClick={onClose}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", fontSize: "20px", fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}
              aria-label="Close"
            >
              ×
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "0.4rem", flexWrap: "wrap", paddingRight: "1.5rem" }}>
              <p className="eyebrow" style={{ margin: 0 }}>Prompt {id} · {cat?.label}</p>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DifficultyDots level={prompt.difficulty} size={10} gap={4} />
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg)", opacity: 0.6 }}>
                  {DIFFICULTY_LABELS[prompt.difficulty - 1]}
                </span>
              </span>
            </div>

            <h2 className="heading" style={{ fontSize: "22px", marginBottom: "1rem", lineHeight: 1.25 }}>{prompt.title}</h2>
            <p style={{ fontSize: "14px", color: "#333", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {prompt.description}
            </p>

            <form action={createAction} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <input type="hidden" name="prompt_id" value={id} />
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px", color: "#666" }}>
                  Exhibition name
                </label>
                <input
                  name="title"
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  placeholder="My TOK Exhibition"
                  className="field-input"
                  style={{ fontSize: "13px", padding: "6px 10px" }}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn-primary btn-primary-hover">
                  Select this prompt →
                </button>
              </div>
            </form>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setChatOpen((v) => !v)}
                className="btn-ghost btn-ghost-hover"
                style={{ position: "relative" }}
              >
                {chatOpen ? "Hide AI" : "Ask AI"}
                {!chatOpen && messages.length > 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "var(--fg)", border: "2px solid " + catColor,
                  }} />
                )}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat-panel"
                initial={{ opacity: 0, x: 32, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "48%" }}
                exit={{ opacity: 0, x: 24, width: 0 }}
                transition={{
                  opacity: { duration: 0.28, ease: EASE_OUT_EXPO },
                  x: { duration: 0.34, ease: EASE_OUT_EXPO },
                  width: { duration: 0.38, ease: EASE_OUT_EXPO },
                }}
                style={{
                  background: "var(--surface)",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "8px 8px 0 0 var(--fg)",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "85vh",
                  minWidth: 0,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  padding: "0.875rem 1.125rem 0.75rem",
                  borderBottom: "2px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <p className="eyebrow" style={{ margin: 0 }}>Ask AI</p>
                  <button
                    onClick={() => setChatOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", fontWeight: 700, color: "var(--fg)", lineHeight: 1, padding: "2px 4px" }}
                    aria-label="Close chat"
                  >
                    ×
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.125rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {messages.length === 0 && !aiLoading && (
                    <p style={{ fontSize: "13px", color: "#999", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.5 }}>
                      Ask anything about this prompt.
                    </p>
                  )}

                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      {msg.role === "ai" && (
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "3px", paddingLeft: "2px" }}>AI</span>
                      )}
                      <div style={{
                        maxWidth: "88%",
                        padding: "8px 11px",
                        borderRadius: "var(--radius)",
                        border: "2px solid var(--border)",
                        background: msg.role === "user" ? "var(--fg)" : catColor,
                        color: msg.role === "user" ? "var(--bg)" : "var(--fg)",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}>
                        {msg.role === "user" ? (
                          msg.text
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p style={{ margin: "0 0 0.5em", lineHeight: 1.55 }}>{children}</p>,
                              strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                              em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
                              ul: ({ children }) => <ul style={{ margin: "0.25em 0 0.5em", paddingLeft: "1.25em" }}>{children}</ul>,
                              ol: ({ children }) => <ol style={{ margin: "0.25em 0 0.5em", paddingLeft: "1.25em" }}>{children}</ol>,
                              li: ({ children }) => <li style={{ marginBottom: "0.2em" }}>{children}</li>,
                              code: ({ children }) => <code style={{ fontFamily: "monospace", fontSize: "12px", background: "rgba(0,0,0,0.08)", padding: "1px 4px", borderRadius: "2px" }}>{children}</code>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {aiLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "3px", paddingLeft: "2px" }}>AI</span>
                      <div style={{
                        padding: "10px 12px",
                        border: "2px solid var(--border)",
                        borderRadius: "var(--radius)",
                        background: catColor,
                        display: "flex", gap: "5px", alignItems: "center",
                      }}>
                        {[0, 1, 2].map((i) => (
                          <span key={i} style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: "var(--fg)", opacity: 0.5,
                            animation: "pulse 1.2s ease-in-out infinite",
                            animationDelay: `${i * 0.18}s`,
                          }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {aiError && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{
                        padding: "7px 10px",
                        border: "2px solid var(--border)",
                        borderRadius: "var(--radius)",
                        background: "var(--pink)",
                        fontSize: "12px", color: "var(--fg)", lineHeight: 1.4,
                        display: "flex", gap: "8px", alignItems: "center",
                      }}>
                        <span>{aiError}</span>
                        <button
                          onClick={() => {
                            const last = messages.findLast?.((m) => m.role === "user");
                            if (last) sendMessage(last.text);
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0, textDecoration: "underline" }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 && (
                  <div style={{ padding: "0 1.125rem 0.75rem", display: "flex", gap: "6px", flexWrap: "wrap", flexShrink: 0 }}>
                    {CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => sendMessage(chip.question)}
                        disabled={aiLoading}
                        className="tag"
                        style={{
                          cursor: aiLoading ? "not-allowed" : "pointer",
                          background: "var(--bg)",
                          border: "2px solid var(--fg)",
                          opacity: aiLoading ? 0.5 : 1,
                          fontSize: "11px",
                          transition: "opacity 0.15s",
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  style={{
                    padding: "0.75rem 1.125rem",
                    borderTop: "2px solid var(--border)",
                    display: "flex", gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this prompt…"
                    disabled={aiLoading}
                    className="field-input"
                    style={{ flex: 1, fontSize: "13px", padding: "7px 10px" }}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !input.trim()}
                    className="btn-primary btn-primary-hover"
                    style={{ padding: "7px 14px", fontSize: "12px", opacity: aiLoading || !input.trim() ? 0.45 : 1, transition: "opacity 0.15s", flexShrink: 0 }}
                  >
                    Send
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>,
    document.body
  );
}

// ── Difficulty dots ─────────────────────────────────────────────
const DIFFICULTY_LABELS = ["Accessible", "Straightforward", "Moderate", "Challenging", "Advanced"] as const;

function DifficultyDots({ level, size = 7, gap = 3 }: { level: 1 | 2 | 3 | 4 | 5; size?: number; gap?: number }) {
  return (
    <span
      title={`Difficulty: ${level}/5 — ${DIFFICULTY_LABELS[level - 1]}`}
      style={{ display: "inline-flex", alignItems: "center", gap, flexShrink: 0 }}
      aria-label={`Difficulty ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: i <= level ? "var(--fg)" : "rgba(0,0,0,0.15)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      ))}
    </span>
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
