"use client";

import { useEffect, useState, useTransition } from "react";
import type { TOKObject } from "@/types";

interface Props {
  slot: number;
  exhibitionId: string;
  object: TOKObject | null;
  prompt: string;
  saveObject: (formData: FormData) => Promise<void>;
  deleteObject: (exhibitionId: string, objectId: string) => Promise<void>;
}

export default function ObjectCard({ slot, exhibitionId, object, prompt, saveObject, deleteObject }: Props) {
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

  const wordCount = justification.trim() ? justification.trim().split(/\s+/).length : 0;
  const wordCountColor = wordCount === 0 ? "#aaa" : wordCount < 95 ? "#888" : wordCount <= 150 ? "#16a34a" : "#dc2626";

  const slotLabel = ["First", "Second", "Third"][slot];
  const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
  const accent = accentColors[slot];

  useEffect(() => {
    setEditing(!object);
    setJustification(object?.justification ?? "");
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

      // Save justification via server action
      const formData = new FormData();
      formData.set("exhibition_id", exhibitionId);
      formData.set("object_id", object.id);
      formData.set("justification", data.text);
      // We call saveJustification indirectly: patch via saveObject with just justification
      // Actually we'll POST to a dedicated route pattern via fetch to keep client-clean
      await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification: data.text }),
      });
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
    } catch {
      setSaveError("Failed to save. Check connection and try again.");
    }
  }

  async function handleDelete() {
    if (!object) return;
    startTransition(() => deleteObject(exhibitionId, object.id));
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
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={object?.description ?? ""}
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
                  }}
                  className="btn-ghost btn-ghost-hover"
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
              <button
                onClick={handleGenerateJustification}
                disabled={aiLoading}
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
        </div>
      )}
      </div>
    </div>
  );
}
