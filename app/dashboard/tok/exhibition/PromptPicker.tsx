"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { TOK_PROMPTS, TOK_CATEGORIES, type TOKCategoryId } from "@/lib/tok-prompts";

const SEEN_KEY = "tok-prompt-tour-seen-v2";

// Pseudo-random but stable scatter coords for messy phase, normalized 0..1
const messyPos = (id: number) => {
  const a = (id * 9301 + 49297) % 233280;
  const b = (id * 4337 + 12345) % 233280;
  const r = (id * 1597 + 51749) % 233280;
  return {
    xPct: (a / 233280) * 0.92 + 0.04,   // 4..96%
    yPct: (b / 233280) * 0.85 + 0.02,   // 2..87%
    rot: ((r / 233280) - 0.5) * 10,     // ±5deg
  };
};

const TOUR_PHASES = {
  messy: 0,
  descriptions: 1,
  colorize: 2,
  organize: 3,
  done: 4,
};

export default function PromptPicker({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [progress, setProgress] = useState(0); // 0..4 continuous
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  function runTour(durationMs = 7500) {
    cancel();
    setDone(false);
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      // Map t (0..1) → phase progress (0..4) with custom pacing
      // Ease in, hold, ease out per phase to avoid jumps
      const p = phaseFromT(t);
      setProgress(p);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
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
    setProgress(TOUR_PHASES.done);
    setDone(true);
    sessionStorage.setItem(SEEN_KEY, "1");
  }

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setSkipped(true);
      setProgress(TOUR_PHASES.done);
      setDone(true);
    } else {
      runTour();
    }
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <LayoutGroup>
        <PromptsCanvas
          progress={progress}
          done={done}
          onExpand={done ? setExpandedId : () => {}}
        />
      </LayoutGroup>

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

// Smooth pacing — 4 phases stretched across t=0..1 with overlap
function phaseFromT(t: number): number {
  // Phase 1 (descriptions): 0.10..0.30
  // Phase 2 (colorize):     0.30..0.55
  // Phase 3 (organize):     0.55..1.00
  // Smooth ease (cubic) within each transition
  const ease = (x: number) => x * x * (3 - 2 * x); // smoothstep
  if (t < 0.10) return 0;
  if (t < 0.30) return ease((t - 0.10) / 0.20) * 1;
  if (t < 0.55) return 1 + ease((t - 0.30) / 0.25) * 1;
  if (t < 1.00) return 2 + ease((t - 0.55) / 0.45) * 2;
  return 4;
}

function PromptsCanvas({ progress, done, onExpand }: { progress: number; done: boolean; onExpand: (id: number) => void }) {
  const allIds = Object.keys(TOK_PROMPTS).map(Number);
  // Continuous 0..1 mixers per phase
  const descT  = Math.min(Math.max(progress - 0, 0), 1);          // 0..1 over phase 1
  const colorT = Math.min(Math.max(progress - 1, 0), 1);          // 0..1 over phase 2
  const orgT   = Math.min(Math.max((progress - 2) / 2, 0), 1);    // 0..1 over phase 3 (which spans 2 units)

  // While organizing (orgT < 1), use absolute scattered positioning blended toward grid.
  // Once orgT === 1, switch to flow grid layout (LayoutGroup will animate the transition smoothly).
  const flowing = orgT >= 1;

  if (flowing) {
    return <SortedFlow allIds={allIds} done={done} onExpand={onExpand} />;
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "640px" }}>
      {allIds.map((id) => {
        const prompt = TOK_PROMPTS[id];
        const cat = TOK_CATEGORIES.find((c) => c.promptIds.includes(id));
        const { xPct, yPct, rot } = messyPos(id);

        // Compute target position scattered across full width
        const x = `${xPct * 100}%`;
        const y = `${yPct * 640}px`;

        // Color tween — white → category color
        const bgColor = cat ? lerpColor("#ffffff", resolveColor(cat.color), colorT) : "#ffffff";
        const currentRot = rot * (1 - colorT * 0.8); // de-rotate as colors come in

        return (
          <motion.div
            layoutId={`prompt-${id}`}
            key={id}
            initial={false}
            animate={{
              left: x,
              top: y,
              rotate: currentRot,
              backgroundColor: bgColor,
            }}
            transition={{ type: "spring", stiffness: 30, damping: 16, mass: 1.2 }}
            style={{
              position: "absolute",
              width: "240px",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "0.85rem 1rem",
              transformOrigin: "center",
              willChange: "transform",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.4)", minWidth: "16px", paddingTop: "1px" }}>{id}</span>
              <p style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.35 }}>{prompt.title}</p>
            </div>
            <motion.div
              animate={{ opacity: descT, height: descT > 0.1 ? "auto" : 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: "hidden", marginTop: descT > 0.1 ? "0.4rem" : 0 }}
            >
              <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, paddingLeft: "calc(16px + 0.5rem)" }}>
                {prompt.description.length > 100 ? prompt.description.slice(0, 100) + "…" : prompt.description}
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SortedFlow({ allIds, done, onExpand }: { allIds: number[]; done: boolean; onExpand: (id: number) => void }) {
  const [activeCategory, setActiveCategory] = useState<TOKCategoryId | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {done && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}
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
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {TOK_CATEGORIES.filter((c) => activeCategory === null || c.id === activeCategory).map((cat) => (
          <motion.section
            key={cat.id}
            layout
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
                  <motion.div
                    layoutId={`prompt-${id}`}
                    key={id}
                    onClick={() => onExpand(id)}
                    whileHover={{ x: -3, y: -3, boxShadow: "6px 6px 0 0 var(--fg)" }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    style={{
                      cursor: done ? "pointer" : "default",
                      padding: "0.75rem 0.9rem",
                      background: cat.color,
                      border: "2px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(0,0,0,0.5)", minWidth: "16px", paddingTop: "1px" }}>{id}</span>
                      <p style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.35 }}>{prompt.title}</p>
                    </div>
                    <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, paddingLeft: "calc(16px + 0.5rem)" }}>
                      {prompt.description.length > 90 ? prompt.description.slice(0, 90) + "…" : prompt.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
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
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
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
                  <button
                    onClick={() => askAI("What is this prompt really asking?")}
                    disabled={aiLoading}
                    className="tag"
                    style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}
                  >
                    What's it asking?
                  </button>
                  <button
                    onClick={() => askAI("What kinds of objects would work well for this prompt? Give 3 example object types and why.")}
                    disabled={aiLoading}
                    className="tag"
                    style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}
                  >
                    Suggest objects
                  </button>
                  <button
                    onClick={() => askAI("What are the key knowledge questions inside this prompt I should think about?")}
                    disabled={aiLoading}
                    className="tag"
                    style={{ cursor: "pointer", background: "var(--bg)", border: "2px solid var(--fg)" }}
                  >
                    Key KQs
                  </button>
                </div>
                {aiLoading && <p style={{ fontSize: "12px", color: "#555" }}>Thinking…</p>}
                {aiError && <p style={{ fontSize: "12px", color: "#c00" }}>{aiError}</p>}
                {aiAnswer && (
                  <p style={{ fontSize: "13px", color: "#222", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnswer}</p>
                )}
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
