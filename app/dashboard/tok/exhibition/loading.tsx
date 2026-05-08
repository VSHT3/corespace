export default function ExhibitionListLoading() {
  return (
    <main style={{ flex: 1, maxWidth: "860px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <div style={{ height: "11px", width: "100px", background: "#e5e5e5", borderRadius: "2px", marginBottom: "0.5rem", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: "32px", width: "180px", background: "#e5e5e5", borderRadius: "2px", animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
        <div style={{ height: "34px", width: "140px", background: "#e5e5e5", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "90px",
              background: "#f5f5f5",
              border: "2px solid #e5e5e5",
              borderRadius: "4px",
              animation: "pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
