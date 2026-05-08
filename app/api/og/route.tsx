import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Corespace";
  const sub = searchParams.get("sub") ?? "IB Core made manageable";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#fffdf5",
          padding: "60px 72px",
          fontFamily: "system-ui, sans-serif",
          border: "8px solid #111",
        }}
      >
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "12px", background: "#fde68a", display: "flex" }} />

        {/* Logo */}
        <div style={{ position: "absolute", top: "52px", left: "72px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "#111" }}>Corespace</span>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#aaa" }}>for IB</span>
        </div>

        {/* Main text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "52px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#111", maxWidth: "880px" }}>
            {title}
          </span>
          <span style={{ fontSize: "22px", color: "#555", fontWeight: 400, maxWidth: "720px" }}>
            {sub}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
