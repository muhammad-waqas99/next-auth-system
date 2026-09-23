"use client";

import { useThemeStore } from "@/app/store/theme/themeStore";

const ThemeSelector = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <select
      value={theme}
      onChange={(e) =>
        setTheme(e.target.value as "light" | "dark" | "system")
      }
      className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
};

export default ThemeSelector;