export const THEME_STORAGE_KEY = "acceent-theme";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_CHANGE_EVENT = "acceent-theme-change";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(
  preference: ThemePreference,
  systemTheme?: ResolvedTheme
): ResolvedTheme {
  if (preference === "system") {
    return systemTheme ?? getSystemTheme();
  }
  return preference;
}

export function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : "light";
  } catch {
    return "light";
  }
}

export function getResolvedThemeSnapshot(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }
  return resolveTheme(readStoredThemePreference());
}

export function applyThemeToDocument(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

export function setThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Ignore storage failures (private mode / quota exceeded)
    }
    applyThemeToDocument(resolved);
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: { preference, resolved } })
    );
  }

  return resolved;
}

export function subscribeTheme(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      applyThemeToDocument(getResolvedThemeSnapshot());
      callback();
    }
  };

  const handleCustomChange = () => {
    callback();
  };

  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  const handleMediaChange = () => {
    if (readStoredThemePreference() === "system") {
      applyThemeToDocument(getResolvedThemeSnapshot());
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, handleCustomChange);
  mediaQuery?.addEventListener?.("change", handleMediaChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, handleCustomChange);
    mediaQuery?.removeEventListener?.("change", handleMediaChange);
  };
}

/**
 * Script inline exécuté avant l'hydratation pour éviter tout flash clair/sombre (FOUC).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY
)};var t=localStorage.getItem(k);var d=t==="dark"||(t==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",Boolean(d));r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
