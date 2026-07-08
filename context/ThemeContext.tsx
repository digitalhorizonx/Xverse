"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "xverse-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
      return;
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setThemeState(prefersLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
