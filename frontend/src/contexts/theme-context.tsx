"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "warm";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "warm",
  setTheme: () => {},
});

const ALL_THEMES: Theme[] = ["dark", "light", "warm"];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("warm");

  useEffect(() => {
    const stored = localStorage.getItem("hariyuka-theme") as Theme | null;
    const initial = ALL_THEMES.includes(stored as Theme) ? (stored as Theme) : "warm";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove(...ALL_THEMES);
    root.classList.add(t);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("hariyuka-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
