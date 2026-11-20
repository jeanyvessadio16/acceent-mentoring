import { test, expect } from "@playwright/test";

test.describe("Parcours publics et protection des espaces MVP", () => {
  test("les pages publiques essentielles répondent correctement", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    for (const path of [
      "/",
      "/mentors",
      "/masterclasses",
      "/opportunities",
      "/cgu",
      "/privacy",
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("les routes protégées du MVP redirigent les visiteurs non connectés vers /login", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    for (const protectedPath of [
      "/beneficiary/messages",
      "/mentor/requests",
      "/admin/moderation",
    ]) {
      await page.goto(protectedPath, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
