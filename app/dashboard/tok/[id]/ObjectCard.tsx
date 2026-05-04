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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    try {
      const res = await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setSaveError("Failed to save. Check connection and try again.");
    }
  }

  async function handleDelete() {
    if (!object) return;
    startTransition(() => deleteObject(exhibitionId, object.id));
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
            <input
              name="object_type"
              type="text"
              defaultValue={object?.object_type ?? ""}
              placeholder="e.g. Personal, Cultural, Natural"
              className="field-input"
            />
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
            <button
              onClick={handleGenerateJustification}
              disabled={aiLoading}
              className="btn-primary btn-primary-hover"
              style={{ fontSize: "11px", padding: "4px 12px", background: accent, color: "var(--fg)", borderColor: "var(--fg)" }}
            >
              {aiLoading ? "Generating…" : "Generate with AI"}
            </button>
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

          {!aiLoading && !saveError && (
            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              Auto-saved on blur. Edit freely after generating.
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
