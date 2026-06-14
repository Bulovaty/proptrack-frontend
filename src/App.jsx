import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Listings from "./pages/Listings";
import Reminders from "./pages/Reminders";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import "./App.css";

function AppContent() {
  const { agent, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  if (!agent) return <Auth />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":   return <Dashboard />;
      case "properties":  return <Properties />;
      case "tenants":     return <Tenants />;
      case "payments":    return <Payments />;
      case "listings":    return <Listings />;
      case "reminders":   return <Reminders />;
      case "search":      return <Search />;
      case "settings":    return <Settings />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} agent={agent} logout={logout} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

