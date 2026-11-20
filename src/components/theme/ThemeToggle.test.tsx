import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY, resolveTheme } from "@/lib/theme";

describe("Theme utilities & ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it("resolveTheme résout correctement light, dark et system", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
    expect(resolveTheme("system", "dark")).toBe("dark");
    expect(resolveTheme("system", "light")).toBe("light");
  });

  it("bascule entre light et dark, met à jour <html> et persiste dans localStorage", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", {
      name: "Activer le mode sombre",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Bascule en mode sombre
    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Activer le mode clair" })
    ).toHaveAttribute("aria-pressed", "true");

    // Re-bascule en mode clair
    fireEvent.click(
      screen.getByRole("button", { name: "Activer le mode clair" })
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(
      screen.getByRole("button", { name: "Activer le mode sombre" })
    ).toHaveAttribute("aria-pressed", "false");
  });
});
