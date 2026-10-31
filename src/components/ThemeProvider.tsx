"use client";

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Always force light mode — dark mode disabled
    document.documentElement.classList.remove("dark");
    localStorage.setItem("-theme", "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => { } }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
