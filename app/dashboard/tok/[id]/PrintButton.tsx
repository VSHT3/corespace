"use client";

interface Props {
  exhibitionId: string;
}

export default function PrintButton({ exhibitionId }: Props) {
  async function downloadFrom(url: string, filename: string) {
    const res = await fetch(url);
    if (!res.ok) return;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
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
      <button
        onClick={() => downloadFrom(`/api/tok/export?id=${exhibitionId}`, "tok-exhibition.json")}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "11px", padding: "4px 10px" }}
        title="Download exhibition as JSON"
      >
        Export JSON
      </button>
    </div>
  );
}
