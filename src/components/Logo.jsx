import { useMode } from "../context/ModeContext";
import { LogoMark } from "./Logo";
import {
  IconDashboard, IconSearch, IconBuilding, IconUsers,
  IconCreditCard, IconHome, IconBell, IconDollarSign,
  IconSettings, IconLogout, IconSun, IconMoon
} from "./Icons";
import "./Sidebar.css";

const NAV = [
  { id: "dashboard",  label: "Dashboard",  Icon: IconDashboard },
  { id: "search",     label: "Search",     Icon: IconSearch },
  { id: "properties", label: "Properties", Icon: IconBuilding },
  { id: "tenants",    label: "Tenants",    Icon: IconUsers },
  { id: "payments",   label: "Payments",   Icon: IconCreditCard },
  { id: "listings",   label: "Listings",   Icon: IconHome },
  { id: "reminders",  label: "Reminders",  Icon: IconBell },
  { id: "billing",    label: "Billing",    Icon: IconDollarSign },
  { id: "settings",   label: "Settings",   Icon: IconSettings },
];

export default function Sidebar({ activePage, setActivePage, agent, logout, isOpen, onClose }) {
  const { mode, toggle } = useMode();
  const initials = agent?.name
    ? agent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AG";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Close on mobile */}
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
