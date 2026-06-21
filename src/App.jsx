import { useState, useCallback, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ModeProvider } from "./context/ModeContext";
import Sidebar from "./components/Sidebar";
import { LogoMark } from "./components/Logo";
import Onboarding from "./components/Onboarding";
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
  const [authMode, setAuthMode] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users who haven't seen it
  useEffect(() => {
    if (agent) {
      const seen = localStorage.getItem(`proptrack_onboarded_${agent.id}`);
      if (!seen) setShowOnboarding(true);
    }
  }, [agent]);

  const dismissOnboarding = () => {
    if (agent) localStorage.setItem(`proptrack_onboarded_${agent.id}`, "1");
    setShowOnboarding(false);
  };

  const navigate = useCallback((page) => {
    setActivePage(page);
    setSidebarOpen(false);
  }, []);

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
      case "properties":  return <Properties navigate={navigate} />;
      case "tenants":     return <Tenants />;
      case "payments":    return <Payments navigate={navigate} />;
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
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <LogoMark size={26} />
          PropTrack
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
      </header>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        activePage={activePage}
        setActivePage={navigate}
        agent={agent}
        logout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      {/* Onboarding overlay for new users */}
      {showOnboarding && (
        <Onboarding
          onNavigate={navigate}
          onDismiss={dismissOnboarding}
        />
      )}
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