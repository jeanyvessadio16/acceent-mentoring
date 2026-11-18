import { test, expect } from "@playwright/test";

test.describe("Navigation et Accessibilité Publique", () => {
  test("la page d'accueil charge avec succès le logo et le titre", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MentorPro|ACCEENT/i);
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("accès fluide vers la page de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText(/Se connecter/i);
  });

  test("accès au formulaire d'inscription multi-étapes", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("text=Choisir votre profil")).toBeVisible();
    await expect(page.locator("text=Bénéficiaire")).toBeVisible();
  });
});
