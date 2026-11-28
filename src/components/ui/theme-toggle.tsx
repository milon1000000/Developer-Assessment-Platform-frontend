"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    const isCurrentlyDark = resolvedTheme
      ? resolvedTheme === "dark"
      : document.documentElement.classList.contains("dark");
    setTheme(isCurrentlyDark ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="group rounded-full border-border/60 bg-background/80 text-foreground backdrop-blur-md hover:bg-muted transition-all duration-200 cursor-pointer"
      onClick={handleToggle}
      title={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
    >
      <Sun className="hidden h-4 w-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45 dark:block" />
      <Moon className="block h-4 w-4 text-slate-700 transition-transform duration-200 group-hover:-rotate-12 dark:hidden" />
    </Button>
  );
}
