"use client";

import { useEffect } from "react";

import { useThemeStore } from "@/app/store/theme/themeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const applyTheme = () => {
      const resolvedTheme =
        theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : theme;

      document.documentElement.setAttribute(
        "data-theme",
        resolvedTheme
      );
    };

    applyTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);

      return () => {
        mediaQuery.removeEventListener("change", applyTheme);
      };
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;