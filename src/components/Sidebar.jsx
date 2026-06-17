import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "\u2295", label: "Dashboard" },
  { id: "search", icon: "\u{1F50D}", label: "Search" },
  { id: "properties", icon: "\u{1F3E2}", label: "Properties" },
  { id: "tenants", icon: "\u{1F465}", label: "Tenants" },
  { id: "payments", icon: "\u{1F4B3}", label: "Payments" },
  { id: "listings", icon: "\u{1F3E0}", label: "Listings" },
  { id: "reminders", icon: "\u{1F514}", label: "Reminders" },
  { id: "billing", icon: "\u{1F4B0}", label: "Billing" },
  { id: "settings", icon: "\u2699\uFE0F", label: "Settings" },
];

export default function Sidebar({ activePage, setActivePage, agent, logout, isOpen, onClose }) {
  const initials = agent?.name
    ? agent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AG";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        style={{
          display: "none", position: "absolute", top: 12, right: 12,
          background: "none", border: "none", color: "var(--text-secondary)",
          fontSize: 22, cursor: "pointer", zIndex: 1,
          ...(isOpen ? { display: "flex" } : {})
        }}
        className="sidebar-close"
      >&#10005;</button>

      <div className="sidebar-logo">
        <span className="logo-icon">P</span>
        <div>
          <div className="logo-name">PropTrack</div>
          <div className="logo-tag">Property Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV.map((item, i) => (
          <div key={item.id}>
            {i === 4 && <div className="nav-divider" />}
            {i === 7 && <div className="nav-divider" />}
            <button
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activePage === item.id && <span className="nav-dot" />}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="agent-card">
          <div className="agent-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="agent-name">{agent?.name}</div>
            <div className="agent-plan">{agent?.plan} Plan</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">{"\u23CF"}</button>
        </div>
      </div>
    </aside>
  );
}