import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import colors from "@/constants/colors";

type ColorPalette = typeof colors.light & { radius: number };
export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  colors: ColorPalette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const lightPalette: ColorPalette = { ...colors.light, radius: colors.radius };
const darkPalette: ColorPalette = { ...colors.dark, radius: colors.radius };

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  colors: lightPalette,
  toggle: () => {},
  setMode: () => {},
});

const THEME_KEY = "@eoh_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "dark" || v === "light") setModeState(v);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const palette = mode === "dark" ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ mode, colors: palette, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
