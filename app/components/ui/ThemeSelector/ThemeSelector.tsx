"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useThemeStore } from "@/app/store/theme/themeStore";

type Theme = "light" | "dark" | "system";

const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const themes: {
    value: Theme;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun size={17} />,
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon size={17} />,
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor size={17} />,
    },
  ];

  const currentTheme = themes.find((item) => item.value === theme);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change theme"
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors duration-150 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {currentTheme?.icon}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-36 rounded-lg border border-border bg-surface p-1 shadow-sm">
          {themes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setTheme(item.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                theme === item.value
                  ? "bg-background text-foreground"
                  : "text-secondary hover:bg-background hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;