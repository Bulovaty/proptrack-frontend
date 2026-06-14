import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { themeId, setThemeId, themes } = useTheme();
  const { agent } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize PropTrack to match your style</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Account
        </h2>
        <div className="grid-2">
          <div className="form-group">
            <label>Name</label>
            <input className="input" value={agent?.name || ""} disabled />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" value={agent?.email || ""} disabled />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <span className="badge badge-success">{agent?.plan} Plan</span>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
          Color Theme
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Choose an accent color pairing. Changes apply instantly across the whole app.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14
        }}>
          {themes.map(t => {
            const isActive = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  border: isActive ? `2px solid rgb(${t.accent})` : "1px solid var(--border)",
                  background: isActive ? `rgba(${t.accent}, 0.06)` : "var(--bg-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {isActive && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    fontSize: 11, fontWeight: 800, color: `rgb(${t.accent})`
                  }}>
                    &#10003;
                  </span>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `rgb(${t.accent})`,
                    boxShadow: `0 0 16px rgba(${t.accent}, 0.4)`
                  }} />
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `rgb(${t.accent2})`,
                    boxShadow: `0 0 16px rgba(${t.accent2}, 0.4)`
                  }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {t.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

