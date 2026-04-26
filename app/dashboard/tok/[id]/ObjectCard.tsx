"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  const slotLabel = ["First", "Second", "Third"][slot];
  const accentColors = ["var(--pink)", "var(--mint)", "var(--sky)"];
  const accent = accentColors[slot];

  async function handleGenerateJustification() {
    if (!object) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt:
            "You are an IB Theory of Knowledge expert. Write a clear, concise justification (3–4 sentences) for why a specific object is relevant to the given TOK exhibition prompt. Focus on knowledge questions, ways of knowing, and areas of knowledge. Write for a student submitting their TOK exhibition commentary.",
          prompt: `TOK Prompt: "${prompt}"\n\nObject: "${object.title}" (type: ${object.object_type || "unspecified"})\nDescription: ${object.description || "(none provided)"}\n\nWrite the justification for this object.`,
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
      // We call saveJustification indirectly — patch via saveObject with just justification
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
    try {
      await fetch("/api/tok/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId, objectId: object.id, justification }),
      });
    } catch {}
  }

  async function handleDelete() {
    if (!object) return;
    startTransition(() => deleteObject(exhibitionId, object.id));
  }

  return (
    <div className="card" style={{ borderLeft: `4px solid ${accent}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="tag" style={{ background: accent }}>{slotLabel} Object</span>
          {object && !editing && (
            <span style={{ fontWeight: 700, fontSize: "15px" }}>{object.title}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {object && (
            <>
              <button
                onClick={() => setEditing((v) => !v)}
                className="btn-ghost btn-ghost-hover"
                style={{ fontSize: "11px", padding: "4px 10px" }}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="btn-ghost btn-ghost-hover"
                style={{ fontSize: "11px", padding: "4px 10px", color: "#c00", borderColor: "#c00" }}
              >
                Remove
              </button>
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
            {object ? "Update Object" : "Add Object"}
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

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
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
            <p style={{ color: "#c00", fontSize: "13px", marginBottom: "0.5rem" }}>{aiError}</p>
          )}

          <textarea
            rows={5}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            onBlur={handleSaveJustification}
            placeholder="Write your justification here, or generate one with AI above."
            className="field-input"
            style={{ resize: "vertical" }}
          />
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
            Auto-saved on blur. Edit freely after generating.
          </p>
        </div>
      )}
    </div>
  );
}
