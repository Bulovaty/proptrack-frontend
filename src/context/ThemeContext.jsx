import { createContext, useContext, useState, useEffect } from "react";

// 10 hand-picked "married" color combos â€” accent + secondary accent
export const THEMES = [
  {
    id: "emerald-sky",
    name: "Emerald & Sky",
    accent: "0, 229, 160",
    accent2: "14, 165, 233",
  },
  {
    id: "violet-amber",
    name: "Violet & Amber",
    accent: "139, 92, 246",
    accent2: "245, 158, 11",
  },
  {
    id: "rose-teal",
    name: "Rose & Teal",
    accent: "244, 63, 94",
    accent2: "20, 184, 166",
  },
  {
    id: "orange-indigo",
    name: "Orange & Indigo",
    accent: "251, 146, 60",
    accent2: "99, 102, 241",
  },
  {
    id: "cyan-pink",
    name: "Cyan & Pink",
    accent: "34, 211, 238",
    accent2: "236, 72, 153",
  },
  {
    id: "lime-purple",
    name: "Lime & Purple",
    accent: "163, 230, 53",
    accent2: "168, 85, 247",
  },
  {
    id: "crimson-gold",
    name: "Crimson & Gold",
    accent: "239, 68, 68",
    accent2: "234, 179, 8",
  },
  {
    id: "blue-coral",
    name: "Blue & Coral",
    accent: "59, 130, 246",
    accent2: "251, 113, 133",
  },
  {
    id: "mint-plum",
    name: "Mint & Plum",
    accent: "52, 211, 153",
    accent2: "192, 132, 252",
  },
  {
    id: "gold-periwinkle",
    name: "Gold & Periwinkle",
    accent: "250, 204, 21",
    accent2: "129, 140, 248",
  },
];

const ThemeContext = createContext(null);

const rgb = (v) => `rgb(${v})`;
const rgba = (v, a) => `rgba(${v}, ${a})`;

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty("--accent", rgb(theme.accent));
  root.style.setProperty("--accent-2", rgb(theme.accent2));
  root.style.setProperty("--accent-dim", rgba(theme.accent, 0.08));
  root.style.setProperty("--accent-dim-2", rgba(theme.accent2, 0.08));
  root.style.setProperty("--accent-glow", rgba(theme.accent, 0.25));
  root.style.setProperty("--accent-glow-2", rgba(theme.accent2, 0.25));
  root.style.setProperty("--border-accent", rgba(theme.accent, 0.2));
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("proptrack_theme") || "emerald-sky";
  });

  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    applyTheme(theme);
    localStorage.setItem("proptrack_theme", themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

