import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./context";
import { THEMES, THEME_STORAGE_KEY } from "./constants";
import {
  applyResolvedTheme,
  getInitialThemePreference,
  getSystemTheme,
  resolveTheme,
} from "./utils";
import type { Theme } from "./types";

export type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialThemePreference());

  const toggleTheme = () => {
    setTheme((prev) => {
      const resolved = resolveTheme(prev);
      return resolved === THEMES.dark ? THEMES.light : THEMES.dark;
    });
  };

  const changeTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyResolvedTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (theme !== THEMES.system) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      applyResolvedTheme(getSystemTheme());
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
