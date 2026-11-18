import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, REGEX_PATTERNS } from "./auth";
import { getDashboardUrl, getRedirectUrl } from "@/lib/utils/auth-redirect";

describe("Validation des Schémas d'Authentification (Auth)", () => {
  describe("Regex de sécurité", () => {
    it("valide une adresse email conforme", () => {
      expect(REGEX_PATTERNS.EMAIL.test("test.utilisateur@example.com")).toBe(true);
      expect(REGEX_PATTERNS.EMAIL.test("invalid-email")).toBe(false);
    });

    it("valide un numéro de téléphone international ou local", () => {
      expect(REGEX_PATTERNS.PHONE.test("+221771234567")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("771234567")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("abc123")).toBe(false);
    });

    it("vérifie la robustesse du mot de passe", () => {
      const validPass = "Acceent@2025!";
      expect(REGEX_PATTERNS.PASSWORD_UPPERCASE.test(validPass)).toBe(true);
      expect(REGEX_PATTERNS.PASSWORD_LOWERCASE.test(validPass)).toBe(true);
      expect(REGEX_PATTERNS.PASSWORD_NUMBER.test(validPass)).toBe(true);
      expect(REGEX_PATTERNS.PASSWORD_SPECIAL.test(validPass)).toBe(true);
    });
  });

  describe("loginSchema", () => {
    it("accepte des identifiants valides", () => {
      const res = loginSchema.safeParse({
        email: "user@acceent.sn",
        password: "ValidPassword123!",
        rememberMe: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejette un email mal formaté", () => {
      const res = loginSchema.safeParse({
        email: "invalid-email-format",
        password: "ValidPassword123!",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("registerSchema avec données démographiques", () => {
    const validRegistration = {
      accountType: "beneficiary" as const,
      firstName: "Fatou",
      lastName: "Diop",
      age: 24,
      sexe: "Femme" as const,
      milieuResidence: "Dakar" as const, // wait, milieuResidence: "Rural" | "Urbain"
      phone: "+221770000000",
      country: "Sénégal",
      email: "fatou.diop@example.sn",
      password: "Password@2025",
      confirmPassword: "Password@2025",
      sdh: "Non" as const,
      acceptTerms: true,
      acceptPrivacy: true,
      newsletter: false,
    };

    it("valide un formulaire d'inscription complet avec âge, sexe, milieu et SDH", () => {
      const res = registerSchema.safeParse({
        ...validRegistration,
        milieuResidence: "Urbain",
      });
      expect(res.success).toBe(true);
    });

    it("rejette si les mots de passe ne correspondent pas", () => {
      const res = registerSchema.safeParse({
        ...validRegistration,
        milieuResidence: "Urbain",
        confirmPassword: "DifferentPassword@2025",
      });
      expect(res.success).toBe(false);
    });

    it("rejette si l'âge est en dehors de la fourchette autorisée", () => {
      const res = registerSchema.safeParse({
        ...validRegistration,
        milieuResidence: "Urbain",
        age: 12, // min is 15
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Règles de redirection contextuelle (getRedirectUrl & getDashboardUrl)", () => {
    it("redirige l'administrateur vers /admin", () => {
      expect(getDashboardUrl("ADMIN")).toBe("/admin");
      expect(getRedirectUrl({ role: "ADMIN" })).toBe("/admin");
    });

    it("oriente un nouveau bénéficiaire sans diagnostic vers /diagnostic", () => {
      expect(getRedirectUrl({ role: "BENEFICIAIRE", diagnostic: null })).toBe("/diagnostic");
      expect(getRedirectUrl({ role: "BENEFICIAIRE", diagnostic: { isCompleted: false } })).toBe("/diagnostic");
    });

    it("redirige un bénéficiaire avec diagnostic complété vers son tableau de bord", () => {
      expect(
        getRedirectUrl({ role: "BENEFICIAIRE", diagnostic: { isCompleted: true } })
      ).toBe("/dashboard/beneficiaire");
    });

    it("redirige un mentor en attente de validation vers /dashboard/mentor/candidature", () => {
      expect(
        getRedirectUrl({
          role: "MENTOR",
          mentorProfile: { statutValidation: "PENDING" },
        })
      ).toBe("/dashboard/mentor/candidature");
    });

    it("redirige un mentor actif validé vers /dashboard/mentor", () => {
      expect(
        getRedirectUrl({
          role: "MENTOR",
          mentorProfile: { statutValidation: "ACTIVE" },
        })
      ).toBe("/dashboard/mentor");
    });

    it("redirige experts et partenaires vers leurs tableaux de bord dédiés", () => {
      expect(getRedirectUrl({ role: "EXPERT" })).toBe("/dashboard/expert");
      expect(getRedirectUrl({ role: "PARTENAIRE" })).toBe("/dashboard/partenaire");
    });
  });
});
