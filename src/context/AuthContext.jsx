import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL + "/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("proptrack_token");
    const savedAgent = localStorage.getItem("proptrack_agent");
    if (token && savedAgent) {
      setAgent(JSON.parse(savedAgent));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return false; }

      localStorage.setItem("proptrack_token", data.token);
      localStorage.setItem("proptrack_agent", JSON.stringify(data.agent));
      setAgent(data.agent);
      setError("");
      return true;
    } catch {
      setError("Connection error. Is the backend running?");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return false; }

      localStorage.setItem("proptrack_token", data.token);
      localStorage.setItem("proptrack_agent", JSON.stringify(data.agent));
      setAgent(data.agent);
      setError("");
      return true;
    } catch {
      setError("Connection error. Is the backend running?");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("proptrack_token");
    localStorage.removeItem("proptrack_agent");
    setAgent(null);
  };

  // Allows other parts of the app (e.g. Settings) to update agent info
  // after a successful API update, keeping localStorage in sync.
  const updateAgent = (updatedAgent) => {
    setAgent(updatedAgent);
    localStorage.setItem("proptrack_agent", JSON.stringify(updatedAgent));
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ agent, login, register, logout, error, setError, setAgent: updateAgent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);