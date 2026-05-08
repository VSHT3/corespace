"use client";

interface Props {
  exhibitionId: string;
}

export default function PrintButton({ exhibitionId }: Props) {
  async function handleExportJson() {
    const res = await fetch(`/api/tok/export?id=${exhibitionId}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tok-exhibition.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        onClick={handleExportJson}
        className="btn-ghost btn-ghost-hover"
        style={{ fontSize: "11px", padding: "4px 10px" }}
        title="Download exhibition as JSON"
      >
        Export JSON
      </button>
    </div>
  );
}
