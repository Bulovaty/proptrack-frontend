import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "properties", icon: "🏢", label: "Properties" },
  { id: "tenants", icon: "👥", label: "Tenants" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "listings", icon: "🏠", label: "Listings" },
  { id: "reminders", icon: "🔔", label: "Reminders" },
];

export default function Sidebar({ activePage, setActivePage, agent, logout }) {
  const initials = agent?.name
    ? agent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AG";

  return (
    <aside className="sidebar">
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
            {i === 3 && <div className="nav-divider" />}
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
          <button className="logout-btn" onClick={logout} title="Sign out">⏏</button>
        </div>
      </div>
    </aside>
  );
}