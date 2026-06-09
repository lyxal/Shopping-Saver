import React, { createContext, useContext, useMemo } from "react";
import type { ThemeMode } from "./types";

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceWarm: string;
  text: string;
  muted: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  success: string;
  danger: string;
  line: string;
  white: string;
  black: string;
  shadow: string;
};

export const themes: Record<ThemeMode, ThemePalette> = {
  dark: {
    background: "#000000",
    surface: "#050505",
    surfaceMuted: "#090909",
    surfaceWarm: "#111111",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.58)",
    accent: "#ef9a31",
    accentDeep: "#f4b35e",
    accentSoft: "#8b4b00",
    success: "#4ad08b",
    danger: "#ff3a2f",
    line: "rgba(255,255,255,0.72)",
    white: "#ffffff",
    black: "#000000",
    shadow: "rgba(0,0,0,0.6)",
  },
  light: {
    background: "#ffffff",
    surface: "#f8f8f8",
    surfaceMuted: "#f0f0f0",
    surfaceWarm: "#efefef",
    text: "#0a0a0a",
    muted: "rgba(10,10,10,0.55)",
    accent: "#ef9a31",
    accentDeep: "#8b4b00",
    accentSoft: "#f9d9a7",
    success: "#1d8b5f",
    danger: "#d7362d",
    line: "rgba(10,10,10,0.18)",
    white: "#ffffff",
    black: "#000000",
    shadow: "rgba(20,20,20,0.18)",
  },
};

type ThemeContextValue = {
  mode: ThemeMode;
  palette: ThemePalette;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  mode,
  toggleTheme,
  children,
}: {
  mode: ThemeMode;
  toggleTheme: () => void;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      mode,
      palette: themes[mode],
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
