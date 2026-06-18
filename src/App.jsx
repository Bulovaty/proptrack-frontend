import { useState, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ModeProvider } from "./context/ModeContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Listings from "./pages/Listings";
import Reminders from "./pages/Reminders";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import "./App.css";

function AppContent() {
  const { agent, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null = show landing, "login" = show sign in, "register" = show sign up
  const [authMode, setAuthMode] = useState(null);

  const navigate = useCallback((page) => {
    setActivePage(page);
    setSidebarOpen(false);
  }, []);

  // Not logged in — show landing or auth
  if (!agent) {
    if (authMode === null) {
      return (
        <Landing
          onGetStarted={() => setAuthMode("register")}
          onLogin={() => setAuthMode("login")}
        />
      );
    }
    return <Auth initialTab={authMode} onBack={() => setAuthMode(null)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":   return <Dashboard navigate={navigate} />;
      case "properties":  return <Properties />;
      case "tenants":     return <Tenants />;
      case "payments":    return <Payments />;
      case "listings":    return <Listings />;
      case "reminders":   return <Reminders />;
      case "search":      return <Search />;
      case "settings":    return <Settings />;
      case "billing":     return <Billing />;
      default:            return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <div className="mobile-logo">
          <span style={{ width: 28, height: 28, background: "var(--accent)", color: "#080c14", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>P</span>
          PropTrack
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>&#9776;</button>
      </header>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        activePage={activePage}
        setActivePage={navigate}
        agent={agent}
        logout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ModeProvider>
  );
}