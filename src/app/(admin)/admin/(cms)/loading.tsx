export default function AdminLoading() {
  return (
    <div className="admin-page-stack">
      <section className="admin-panel" style={{ padding: "3rem", textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "admin-spin 0.8s linear infinite",
            margin: "0 auto 1rem"
          }}
        />
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading...</p>
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    </div>
  );
}
