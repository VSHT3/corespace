"use client";

import { useEffect, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import type { TOKObject } from "@/types";
import { useToast } from "@/lib/toast";

interface Props {
  slot: number;
  exhibitionId: string;
  object: TOKObject | null;
  prompt: string;
  saveObject: (formData: FormData) => Promise<void>;
  deleteObject: (exhibitionId: string, objectId: string) => Promise<void>;
}

export default function ObjectCard({ slot, exhibitionId, object, prompt, saveObject, deleteObject }: Props) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(!object);
  const [justification, setJustification] = useState(object?.justification ?? "");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [scoreResult, setScoreResult] = useState<{ score: number; strength: string; weakness: string; tip: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [descValue, setDescValue] = useState(object?.description ?? "");
  const [kqLoading, setKqLoading] = useState(false);
  const [kqResult, setKqResult] = useState("");
  const [kqError, setKqError] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);

  const DESC_MAX = 500;

  const wordCount = justification.trim() ? justification.trim().split(/\s+/).length : 0;
  const wordCountColor = wordCount === 0 ? "#aaa" : wordCount < 95 ? "#888" : wordCount <= 150 ? "#16a34a" : "#dc2626";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("justification-wordcount", { detail: { slot, words: wordCount } }));
  }, [slot, wordCount]);

  const slotLabel = ["First", "Second", "Third"][slot];
  const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
  const accent = accentColors[slot];

  useEffect(() => {
    setEditing(!object);
    setJustification(object?.justification ?? "");
    setDescValue(object?.description ?? "");
    setConfirmingDelete(false);
    setAiError("");
    setSaveError("");
  }, [object]);

  async function handleGenerateJustification() {
    if (!object) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "object_justification",
          userMessage: "Write the justification for this object.",
          context: {
            prompt,
            objectTitle: object.title,
            objectType: object.object_type ?? "",
            objectDescription: object.description ?? "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      setJustification(data.text);
      await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification: data.text }),
      });
      showToast("Justification generated and saved");
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSaveJustification() {
    if (!object) return;
    setSaveError("");
    setSavedOk(false);
    try {
      const res = await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      showToast("Justification saved");
    } catch {
      setSaveError("Failed to save. Check connection and try again.");
      showToast("Save failed — check connection", "error");
    }
  }

  async function handleDelete() {
    if (!object) return;
    startTransition(() => deleteObject(exhibitionId, object.id));
  }

  async function handleChatSend(message: string) {
    if (!message.trim() || chatLoading || !object) return;
    setChatError("");
    const userMsg = { role: "user" as const, text: message.trim() };
    const currentHistory = chatMessages.map((m) => ({ role: m.role === "user" ? "user" as const : "model" as const, text: m.text }));
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "justification_chat",
          userMessage: message.trim(),
          history: currentHistory,
          context: {
            prompt,
            objectTitle: object.title,
            objectType: object.object_type ?? "",
            objectDescription: object.description ?? "",
            justification,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");
      setChatMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    } catch (e: unknown) {
      setChatError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleKnowledgeQuestion() {
    if (!object) return;
    setKqLoading(true);
    setKqError("");
    setKqResult("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "knowledge_question",
          userMessage: "Generate knowledge questions for this object.",
          context: {
            prompt,
            objectTitle: object.title,
            objectType: object.object_type ?? "",
            objectDescription: object.description ?? "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setKqResult(data.text);
    } catch (e: unknown) {
      setKqError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setKqLoading(false);
    }
  }

  async function handleImprove() {
    if (!object || !justification.trim()) return;
    setImproveLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "justification_improve",
          userMessage: "Improve this justification.",
          context: {
            prompt,
            objectTitle: object.title,
            objectType: object.object_type ?? "",
            objectDescription: object.description ?? "",
            justification,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      setJustification(data.text);
      await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification: data.text }),
      });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      showToast("Justification improved and saved");
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Improve failed");
    } finally {
      setImproveLoading(false);
    }
  }

  async function handleScore() {
    if (!object) return;
    setScoreLoading(true);
    setScoreError("");
    setScoreResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "object_scoring",
          userMessage: "Score this object and justification.",
          context: {
            prompt,
            objectTitle: object.title,
            objectType: object.object_type ?? "",
            objectDescription: object.description ?? "",
            justification: justification,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scoring failed");
      const parsed = JSON.parse(data.text);
      setScoreResult(parsed);
    } catch (e: unknown) {
      setScoreError(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setScoreLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ height: "6px", background: accent }} />
      <div style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
          <span className="tag" style={{ background: accent }}>{slotLabel} Object</span>
          {object && !editing && (
            <span style={{ fontWeight: 700, fontSize: "15px", lineHeight: 1.35, overflowWrap: "anywhere" }}>{object.title}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {object && (
            <>
              <button
                onClick={() => setEditing((v) => !v)}
                className="btn-ghost btn-ghost-hover"
                style={{ fontSize: "11px", padding: "4px 10px" }}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              {!confirmingDelete ? (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isPending}
                  className="btn-ghost btn-ghost-hover"
                  style={{ fontSize: "11px", padding: "4px 10px", color: "#c00", borderColor: "#c00" }}
                >
                  Remove
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={{ color: "#555", fontSize: "12px", fontWeight: 700 }}>Remove this object?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="btn-ghost btn-ghost-hover"
                    style={{ fontSize: "11px", padding: "4px 10px", color: "#c00", borderColor: "#c00" }}
                  >
                    {isPending ? "Removing..." : "Yes, remove"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="back-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 0",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Object form */}
      {editing && (
        <form
          action={async (formData) => {
            formData.set("exhibition_id", exhibitionId);
            formData.set("position", String(slot));
            if (object) formData.set("object_id", object.id);
            await saveObject(formData);
            setEditing(false);
          }}
          className="space-y-3 mb-4"
        >
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
              Object Title
            </label>
            <input
              name="title"
              type="text"
              required
              maxLength={100}
              defaultValue={object?.title ?? ""}
              placeholder="e.g. Einstein's notebook"
              className="field-input"
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
              Object Type
            </label>
            <select
              name="object_type"
              defaultValue={object?.object_type ?? ""}
              className="field-input"
            >
              <option value="">— Select type —</option>
              <option value="Personal">Personal</option>
              <option value="Cultural">Cultural</option>
              <option value="Natural">Natural</option>
              <option value="Linguistic">Linguistic</option>
              <option value="Mathematical">Mathematical</option>
              <option value="Scientific">Scientific</option>
              <option value="Artistic">Artistic</option>
              <option value="Historical">Historical</option>
              <option value="Technological">Technological</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Description
              </label>
              {descValue.length > DESC_MAX * 0.8 && (
                <span style={{ fontSize: "10px", color: descValue.length >= DESC_MAX ? "#dc2626" : "#888" }}>
                  {descValue.length}/{DESC_MAX}
                </span>
              )}
            </div>
            <textarea
              name="description"
              rows={3}
              maxLength={DESC_MAX}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="What is this object? Why does it relate to your prompt?"
              className="field-input"
              style={{ resize: "vertical" }}
            />
          </div>
          <button type="submit" className="btn-primary btn-primary-hover">
            Save Object
          </button>
        </form>
      )}

      {/* Justification section */}
      {object && !editing && (
        <div>
          <div style={{ marginBottom: "0.5rem", fontSize: "12px", color: "#666" }}>
            {object.object_type && <span className="tag tag-sky" style={{ marginRight: "6px" }}>{object.object_type}</span>}
            {object.description && <span>{object.description}</span>}
          </div>

          <hr className="divider" style={{ margin: "1rem 0" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Justification
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {justification.trim() && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(justification);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                    showToast("Justification copied to clipboard", "info");
                  }}
                  className="btn-ghost btn-ghost-hover"
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
              {justification.trim() && (
                <button
                  onClick={handleImprove}
                  disabled={improveLoading || aiLoading}
                  className="btn-ghost btn-ghost-hover"
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  title="Rewrite justification to be stronger (keeps your ideas)"
                >
                  {improveLoading ? "Improving…" : "Improve"}
                </button>
              )}
              <button
                onClick={handleGenerateJustification}
                disabled={aiLoading || improveLoading}
                className="btn-primary btn-primary-hover"
                style={{ fontSize: "11px", padding: "4px 12px", background: accent, color: "var(--fg)", borderColor: "var(--fg)" }}
              >
                {aiLoading ? "Generating…" : "Generate with AI"}
              </button>
            </div>
          </div>

          {aiError && (
            <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "12px", padding: "6px 10px", marginBottom: "0.5rem" }}>
              {aiError}
            </p>
          )}

          {aiLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "2px 0" }}>
              {[80, 95, 70, 88, 60].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: "13px",
                    width: `${w}%`,
                    background: "var(--border)",
                    borderRadius: "2px",
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <textarea
              rows={5}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              onBlur={handleSaveJustification}
              placeholder="Write your justification here, or generate one with AI above."
              className="field-input"
              style={{ resize: "vertical" }}
            />
          )}

          {saveError && (
            <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "12px", padding: "6px 10px", marginTop: "4px" }}>
              {saveError}
            </p>
          )}

          {!aiLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
              <p style={{ fontSize: "11px", color: "#aaa" }}>
                {savedOk ? "✓ Saved" : "Auto-saved on blur."}
              </p>
              <p style={{ fontSize: "11px", color: wordCountColor, fontWeight: wordCount >= 95 && wordCount <= 150 ? 700 : 400 }}>
                {wordCount} {wordCount === 1 ? "word" : "words"}
                {wordCount > 0 && wordCount < 95 && <span style={{ color: "#aaa" }}> (aim for 95–150)</span>}
                {wordCount > 150 && <span style={{ color: "#aaa" }}> (over 150)</span>}
                {wordCount >= 95 && wordCount <= 150 && <span style={{ color: "#16a34a" }}> ✓</span>}
              </p>
            </div>
          )}

          {/* AI Scoring */}
          <hr className="divider" style={{ margin: "1rem 0" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Score
            </p>
            <button
              onClick={handleScore}
              disabled={scoreLoading || !justification.trim()}
              className="btn-ghost btn-ghost-hover"
              style={{ fontSize: "11px", padding: "4px 10px" }}
            >
              {scoreLoading ? "Scoring…" : scoreResult ? "Re-score" : "Score with AI"}
            </button>
          </div>

          {scoreError && (
            <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "12px", padding: "6px 10px", marginBottom: "0.5rem" }}>
              {scoreError}
            </p>
          )}

          {scoreLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[60, 80, 50].map((w, i) => (
                <div key={i} style={{ height: "12px", width: `${w}%`, background: "var(--border)", borderRadius: "2px", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}

          {scoreResult && !scoreLoading && (
            <div style={{ background: "var(--bg)", border: "2px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  className="heading"
                  style={{
                    fontSize: "28px",
                    color: scoreResult.score >= 8 ? "#16a34a" : scoreResult.score >= 5 ? "#b45309" : "#dc2626",
                  }}
                >
                  {scoreResult.score}/10
                </span>
                <span
                  className="tag"
                  style={{
                    background: scoreResult.score >= 8 ? "var(--mint)" : scoreResult.score >= 5 ? "var(--yellow)" : "var(--pink)",
                  }}
                >
                  {scoreResult.score >= 8 ? "Strong" : scoreResult.score >= 5 ? "Developing" : "Needs work"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#444", lineHeight: 1.6 }}>
                <p style={{ marginBottom: "0.4rem" }}><strong>✓ </strong>{scoreResult.strength}</p>
                <p style={{ marginBottom: "0.4rem" }}><strong>△ </strong>{scoreResult.weakness}</p>
                <p style={{ background: "var(--yellow)", border: "1px solid var(--border)", borderRadius: "2px", padding: "4px 8px", marginTop: "0.25rem" }}>
                  <strong>Tip: </strong>{scoreResult.tip}
                </p>
              </div>
            </div>
          )}

          {!scoreResult && !scoreLoading && !scoreError && (
            <p style={{ fontSize: "11px", color: "#aaa" }}>
              {justification.trim() ? "Get AI feedback on object quality and justification strength." : "Write a justification first to enable scoring."}
            </p>
          )}

          {/* Knowledge Questions */}
          <hr className="divider" style={{ margin: "1rem 0" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Knowledge Questions
            </p>
            <button
              onClick={handleKnowledgeQuestion}
              disabled={kqLoading}
              className="btn-ghost btn-ghost-hover"
              style={{ fontSize: "11px", padding: "4px 10px" }}
            >
              {kqLoading ? "Generating…" : kqResult ? "Regenerate" : "Generate KQs"}
            </button>
          </div>
          {kqError && (
            <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "12px", padding: "6px 10px", marginBottom: "0.5rem" }}>
              {kqError}
            </p>
          )}
          {kqLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[70, 90, 60].map((w, i) => (
                <div key={i} style={{ height: "12px", width: `${w}%`, background: "var(--border)", borderRadius: "2px", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
          {kqResult && !kqLoading && (
            <div style={{ background: "var(--bg)", border: "2px solid var(--border)", borderRadius: "var(--radius)", padding: "0.875rem 1rem", fontSize: "12px", lineHeight: 1.6 }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: "0 0 0.4em" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: "italic", color: "#555" }}>{children}</em>,
                }}
              >
                {kqResult}
              </ReactMarkdown>
            </div>
          )}
          {!kqResult && !kqLoading && !kqError && (
            <p style={{ fontSize: "11px", color: "#aaa" }}>
              Generate IB-style knowledge questions that could anchor your justification.
            </p>
          )}

          {/* Justification Chat */}
          <hr className="divider" style={{ margin: "1rem 0" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Refine with AI
            </p>
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="btn-ghost btn-ghost-hover"
              style={{ fontSize: "11px", padding: "4px 10px", position: "relative" }}
            >
              {chatOpen ? "Close chat" : "Open chat"}
              {!chatOpen && chatMessages.length > 0 && (
                <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--fg)" }} />
              )}
            </button>
          </div>

          {chatOpen && (
            <div style={{ border: "2px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <div style={{ maxHeight: "200px", overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg)" }}>
                {chatMessages.length === 0 && !chatLoading && (
                  <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", margin: "0.5rem 0" }}>
                    Ask AI to improve, explain, or critique your justification.
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "90%",
                      padding: "6px 10px",
                      borderRadius: "var(--radius)",
                      border: "2px solid var(--border)",
                      background: msg.role === "user" ? "var(--fg)" : accent,
                      color: msg.role === "user" ? "var(--bg)" : "var(--fg)",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: "4px", padding: "4px 2px" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--fg)", opacity: 0.4, display: "inline-block", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.18}s` }} />
                    ))}
                  </div>
                )}
                {chatError && (
                  <p className="tag tag-pink" style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "11px", padding: "4px 8px" }}>{chatError}</p>
                )}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleChatSend(chatInput); }}
                style={{ display: "flex", borderTop: "2px solid var(--border)", background: "var(--surface)" }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your justification…"
                  disabled={chatLoading}
                  style={{ flex: 1, border: "none", outline: "none", padding: "8px 10px", fontSize: "12px", background: "transparent", fontFamily: "inherit" }}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn-primary btn-primary-hover"
                  style={{ fontSize: "11px", padding: "6px 12px", borderRadius: 0, borderLeft: "2px solid var(--border)", opacity: chatLoading || !chatInput.trim() ? 0.4 : 1 }}
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {!chatOpen && (
            <p style={{ fontSize: "11px", color: "#aaa" }}>
              Chat with AI to refine your justification, ask for improvements, or get specific feedback.
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
