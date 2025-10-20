"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  // Align local state with the attribute set by the init script
  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <Button
      aria-label="Toggle theme"
      size="icon"
      variant="secondary"
      onClick={toggle}
    >
      <span aria-hidden className="flex items-center justify-center">
        <Sun className="theme-toggle__sun h-5 w-5" />
        <Moon className="theme-toggle__moon h-5 w-5" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
