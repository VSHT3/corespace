export default function DashboardLoading() {
  return (
    <main style={{ flex: 1, maxWidth: "860px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ height: "11px", width: "120px", background: "#e5e5e5", borderRadius: "2px", marginBottom: "0.75rem", animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: "40px", width: "220px", background: "#e5e5e5", borderRadius: "2px", animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: "180px", background: "#f5f5f5", border: "2px solid #e5e5e5", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </main>
  );
}
