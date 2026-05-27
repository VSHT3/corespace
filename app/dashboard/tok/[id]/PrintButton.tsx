"use client";

import { useToast } from "@/lib/toast";

interface Props {
  exhibitionId: string;
}

export default function PrintButton({ exhibitionId }: Props) {
  const { showToast } = useToast();

  async function downloadFrom(url: string, filename: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Download failed" }));
        showToast(err.error ?? "Download failed", "error");
        return;
      }
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      showToast("Download failed", "error");
    }
  }

  return (
    <div style={{ display: "flex", gap: "6px" }} className="no-print">
      <button
        onClick={() => window.print()}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "11px", padding: "4px 10px" }}
      >
        Print
      </button>
      <button
        onClick={() => downloadFrom(`/api/tok/export-text?id=${exhibitionId}`, "tok-exhibition.txt")}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "11px", padding: "4px 10px" }}
        title="Download as plain text (paste into Word/Docs)"
      >
        Export TXT
      </button>

    </div>
  );
}
