export default function WorkspaceLoading() {
  return (
    <main style={{ flex: 1, width: "100%", maxWidth: "1800px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1.25rem", marginBottom: "1.5rem", alignItems: "start" }}>
        <div>
          <div style={{ height: "11px", width: "80px", background: "#e5e5e5", borderRadius: "2px", marginBottom: "0.5rem", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: "22px", width: "160px", background: "#e5e5e5", borderRadius: "2px", animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
        <div style={{ height: "56px", background: "#f5f0e0", border: "2px solid #e5e5e5", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite", justifySelf: "center", width: "100%" }} />
        <div style={{ height: "22px", width: "80px", background: "#e5e5e5", borderRadius: "2px", justifySelf: "end", animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>

      {/* Prompt description skeleton */}
      <div style={{ height: "60px", maxWidth: "860px", margin: "0 auto 3rem", background: "#f5f0e0", border: "2px solid #e5e5e5", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite" }} />

      {/* 3-column object grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "340px",
              background: "#f5f5f5",
              border: "2px solid #e5e5e5",
              borderRadius: "4px",
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
