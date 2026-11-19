import { describe, it, expect } from "vitest";
import {
  isSafeHttpUrl,
  sanitizeExternalUrl,
  sanitizeInternalRedirectPath,
} from "./url-safety";

describe("url-safety", () => {
  describe("isSafeHttpUrl & sanitizeExternalUrl", () => {
    it("accepte uniquement les URLs https:// et http://", () => {
      expect(isSafeHttpUrl("https://linkedin.com/in/test")).toBe(true);
      expect(isSafeHttpUrl("http://localhost:3001/docs")).toBe(true);
      expect(sanitizeExternalUrl("  https://acceent.sn  ")).toBe(
        "https://acceent.sn"
      );
    });

    it("rejette les schémas dangereux (javascript:, data:, file:) et valeurs invalides", () => {
      expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeHttpUrl("JAVASCRIPT:alert(1)")).toBe(false);
      expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(
        false
      );
      expect(isSafeHttpUrl("file:///etc/passwd")).toBe(false);
      expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
      expect(sanitizeExternalUrl(null)).toBeNull();
      expect(sanitizeExternalUrl("")).toBeNull();
    });
  });

  describe("sanitizeInternalRedirectPath", () => {
    it("accepte un chemin applicatif interne valide", () => {
      expect(sanitizeInternalRedirectPath("/dashboard/mentor")).toBe(
        "/dashboard/mentor"
      );
      expect(sanitizeInternalRedirectPath("/beneficiary/mentors?tab=all")).toBe(
        "/beneficiary/mentors?tab=all"
      );
    });

    it("rejette les redirections externes, protocole-relatives, backslashes et boucles auth", () => {
      expect(sanitizeInternalRedirectPath("//evil.com")).toBeNull();
      expect(sanitizeInternalRedirectPath("https://evil.com")).toBeNull();
      expect(sanitizeInternalRedirectPath("/\\evil.com")).toBeNull();
      expect(sanitizeInternalRedirectPath("/login")).toBeNull();
      expect(sanitizeInternalRedirectPath("/register")).toBeNull();
      expect(sanitizeInternalRedirectPath("")).toBeNull();
    });
  });
});
