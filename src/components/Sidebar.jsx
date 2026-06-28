import { useMode } from "../context/ModeContext";
import { LogoMark } from "./Logo";
import {
  IconDashboard, IconSearch, IconBuilding, IconUsers,
  IconCreditCard, IconHome, IconBell, IconDollarSign,
  IconSettings, IconLogout, IconSun, IconMoon, IconTrendingUp
} from "./Icons";
import "./Sidebar.css";

const NAV_ALL = [
  { id: "dashboard",  label: "Dashboard",  Icon: IconDashboard,   plans: null },
  { id: "search",     label: "Search",     Icon: IconSearch,      plans: null },
  { id: "properties", label: "Properties", Icon: IconBuilding,    plans: null },
  { id: "tenants",    label: "Tenants",    Icon: IconUsers,       plans: null },
  { id: "payments",   label: "Payments",   Icon: IconCreditCard,  plans: null },
  { id: "listings",   label: "Listings",   Icon: IconHome,        plans: null },
  { id: "reminders",  label: "Reminders",  Icon: IconBell,        plans: null },
  // Reports hidden for Starter — Growth/Pro only
  { id: "reports",    label: "Reports",    Icon: IconTrendingUp,  plans: ["Growth", "Pro"] },
  { id: "billing",    label: "Billing",    Icon: IconDollarSign,  plans: null },
  { id: "settings",   label: "Settings",   Icon: IconSettings,    plans: null },
];

export default function Sidebar({ activePage, setActivePage, agent, logout, isOpen, onClose }) {
  const { mode, toggle } = useMode();
  const initials = agent?.name
    ? agent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AG";

  const agentPlan = agent?.plan || "Starter";

  // Filter nav items based on agent's plan
  const NAV = NAV_ALL.filter(item =>
    item.plans === null || item.plans.includes(agentPlan)
  );

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {isOpen && (
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <IconSearch size={18} style={{ transform: "rotate(45deg)" }} />
        </button>
      )}

      <div className="sidebar-logo">
        <LogoMark size={36} />
        <div>
          <div className="logo-name">PropTrack</div>
          <div className="logo-tag">Property Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {NAV.map((item, i) => (
          <div key={item.id}>
            {(i === 4 || i === 7) && <div className="nav-divider" />}
            <button
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
              aria-label={item.label}
            >
              <span className="nav-icon"><item.Icon size={17} /></span>
              <span className="nav-label">{item.label}</span>
              {activePage === item.id && <span className="nav-dot" />}
            </button>
          </div>
        ))}

        {/* Upgrade nudge for Starter — shows what's locked */}
        {agentPlan === "Starter" && (
          <div style={{
            margin: "12px 10px 0",
            padding: "10px 12px",
            borderRadius: 10,
            background: "var(--accent-dim)",
            border: "1px solid var(--border-accent)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
              Starter Plan
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
              Upgrade to unlock WhatsApp reminders, bulk SMS, reports, and more properties.
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: 11, padding: "6px 0" }}
              onClick={() => setActivePage("billing")}
            >
              View Plans
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        {/* Mode toggle */}
        <button className="mode-toggle-sidebar" onClick={toggle} title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {mode === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
          <span>{mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <div className="agent-card">
          <div className="agent-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="agent-name">{agent?.name}</div>
            <div className="agent-plan">{agent?.plan} Plan</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out" aria-label="Sign out">
            <IconLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}