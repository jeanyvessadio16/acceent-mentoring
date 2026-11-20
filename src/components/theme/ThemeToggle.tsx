"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getResolvedThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type ResolvedTheme,
} from "@/lib/theme";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

function getServerSnapshot(): ResolvedTheme {
  return "light";
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getResolvedThemeSnapshot,
    getServerSnapshot
  );

  const isDark = theme === "dark";

  const handleToggle = () => {
    setThemePreference(isDark ? "light" : "dark");
  };

  const label = isDark ? "Activer le mode clair" : "Activer le mode sombre";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        compact ? "h-9 w-9 justify-center p-0" : "h-9 px-3 py-1.5",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      )}
      {!compact && (
        <span className="hidden sm:inline">{isDark ? "Clair" : "Sombre"}</span>
      )}
    </button>
  );
}
