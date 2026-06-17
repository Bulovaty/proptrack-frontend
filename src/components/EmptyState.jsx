export default function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 24px", textAlign: "center"
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>{icon}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
        color: "var(--text-secondary)", marginBottom: 8, letterSpacing: "-0.02em"
      }}>{title}</div>
      {subtitle && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
      {action && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: 24 }}>
          {action}
        </button>
      )}
    </div>
  );
}