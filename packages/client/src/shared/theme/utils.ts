import { THEME_STORAGE_KEY, THEMES } from "./constants";
import type { ResolvedTheme, Theme } from "./types";

export const getSystemTheme = (): ResolvedTheme => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getStoredThemePreference = (): Theme | null => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    saved === THEMES.light ||
    saved === THEMES.dark ||
    saved === THEMES.system
  ) {
    return saved;
  }

  return null;
};

export const resolveTheme = (preference: Theme): ResolvedTheme => {
  return preference === THEMES.system ? getSystemTheme() : preference;
};

export const applyResolvedTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement;

  root.setAttribute("data-theme", resolved);
  root.classList.remove(THEMES.light, THEMES.dark);
  root.classList.add(resolved);
};

export const getInitialThemePreference = (): Theme => {
  return getStoredThemePreference() ?? THEMES.system;
};

export const isValidTheme = (value: string): value is Theme => value in THEMES;
