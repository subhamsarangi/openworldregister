export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#faf6ee",
        zIndex: 9999,
        gap: "1.25rem",
      }}
    >
      {/* Spinning ring */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid rgba(184,74,30,0.15)",
          borderTopColor: "#b84a1e",
          animation: "langtoo-spin 0.75s linear infinite",
        }}
      />

      {/* Brand wordmark */}
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.1rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#6b5740",
          opacity: 0.7,
        }}
      >
        <span style={{ color: "#8a0303" }}>L</span>
        <span style={{ color: "#556b2f" }}>a</span>
        <span style={{ color: "#4b0082" }}>n</span>
        <span style={{ color: "#c57e00" }}>g</span>
        <span style={{ color: "#58111a" }}>t</span>
        <span style={{ color: "#6b5740" }}>oo</span>
      </div>

      <style>{`
        @keyframes langtoo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
