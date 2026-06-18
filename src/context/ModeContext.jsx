import { createContext, useContext, useState, useEffect } from "react";

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("proptrack_mode") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem("proptrack_mode", mode);
  }, [mode]);

  const toggle = () => setMode(m => m === "dark" ? "light" : "dark");

  return (
    <ModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ModeContext.Provider>
  );
}

export const useMode = () => useContext(ModeContext);