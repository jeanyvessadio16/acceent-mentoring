import { describe, it, expect } from "vitest";
import { ROUTES } from "./routes";

describe("ROUTES intra-espace", () => {
  it("expose les routes dédiées pour chacun des 5 espaces sans chemin vide ni relatif", () => {
    const workspaces = {
      ADMIN: [
        ROUTES.ADMIN.DASHBOARD,
        ROUTES.ADMIN.VALIDATIONS,
        ROUTES.ADMIN.USERS,
        ROUTES.ADMIN.SUPERVISION,
        ROUTES.ADMIN.OPPORTUNITIES,
        ROUTES.ADMIN.MASTERCLASSES,
        ROUTES.ADMIN.ANALYTICS,
        ROUTES.ADMIN.PROFILE,
      ],
      BENEFICIARY: [
        ROUTES.BENEFICIARY.DASHBOARD,
        ROUTES.BENEFICIARY.DIAGNOSIS,
        ROUTES.BENEFICIARY.PARCOURS,
        ROUTES.BENEFICIARY.SESSIONS,
        ROUTES.BENEFICIARY.MENTORS,
        ROUTES.BENEFICIARY.OPPORTUNITIES,
        ROUTES.BENEFICIARY.MASTERCLASSES,
        ROUTES.BENEFICIARY.PROFILE,
      ],
      MENTOR: [
        ROUTES.MENTOR.DASHBOARD,
        ROUTES.MENTOR.APPLICATION,
        ROUTES.MENTOR.REQUESTS,
        ROUTES.MENTOR.PARCOURS,
        ROUTES.MENTOR.CALENDAR,
        ROUTES.MENTOR.PROFILE,
      ],
      EXPERT: [
        ROUTES.EXPERT.DASHBOARD,
        ROUTES.EXPERT.MASTERCLASSES,
        ROUTES.EXPERT.SESSIONS,
        ROUTES.EXPERT.PROFILE,
      ],
      PARTNER: [
        ROUTES.PARTNER.DASHBOARD,
        ROUTES.PARTNER.OPPORTUNITIES,
        ROUTES.PARTNER.IMPACT,
        ROUTES.PARTNER.PROFILE,
      ],
    };

    for (const [, routes] of Object.entries(workspaces)) {
      for (const route of routes) {
        expect(route).toMatch(/^\//);
      }
      expect(new Set(routes).size).toBe(routes.length);
    }
  });

  it("génère correctement l'URL de détail d'un mentor dans l'espace bénéficiaire", () => {
    expect(ROUTES.BENEFICIARY.MENTOR_DETAIL("abc")).toBe("/beneficiary/mentors/abc");
  });
});
