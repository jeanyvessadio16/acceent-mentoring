import { ROUTES } from "@/lib/constants";

/**
 * Retourne l'URL de base du tableau de bord selon le rôle de l'utilisateur
 * Conforme à l'implémentation backend d'AuthService
 */
export function getDashboardUrl(role?: string): string {
  const normalizedRole = (role || "").toUpperCase();
  switch (normalizedRole) {
    case "ADMIN":
      return ROUTES.DASHBOARDS.ADMIN;
    case "MENTOR":
      return ROUTES.DASHBOARDS.MENTOR;
    case "EXPERT":
      return ROUTES.DASHBOARDS.EXPERT;
    case "PARTNER":
    case "PARTENAIRE":
      return ROUTES.DASHBOARDS.PARTENAIRE;
    case "BENEFICIARY":
    case "BENEFICIAIRE":
    default:
      return ROUTES.DASHBOARDS.BENEFICIAIRE;
  }
}

function getNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

/**
 * Calcule l'URL de redirection contextuelle vers l'espace de l'utilisateur
 * (ex: /diagnostic si le bénéficiaire n'a pas fait son diagnostic, ou tableau de bord dédié)
 * Conforme à l'implémentation backend d'AuthService
 */
export function getRedirectUrl(user: {
  role?: string;
  accountStatus?: string;
  mentorProfile?: { statutValidation?: string } | null;
  diagnostic?: { isCompleted?: boolean } | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const metadata = user.user_metadata || {};
  const normalizedRole = (
    user.role ||
    getNonEmptyString(metadata.role) ||
    getNonEmptyString(metadata.account_type) ||
    "BENEFICIAIRE"
  ).toUpperCase();

  switch (normalizedRole) {
    case "ADMIN":
      return ROUTES.DASHBOARDS.ADMIN;

    case "MENTOR": {
      const mentorStatus =
        user.mentorProfile?.statutValidation ||
        getNonEmptyString(metadata.status) ||
        getNonEmptyString(metadata.statutCompte) ||
        "PENDING";

      if (mentorStatus === "PENDING" || !user.mentorProfile) {
        return ROUTES.DASHBOARDS.MENTOR_CANDIDATURE;
      }
      return ROUTES.DASHBOARDS.MENTOR;
    }

    case "EXPERT":
      return ROUTES.DASHBOARDS.EXPERT;

    case "PARTNER":
    case "PARTENAIRE":
      return ROUTES.DASHBOARDS.PARTENAIRE;

    case "BENEFICIARY":
    case "BENEFICIAIRE":
    default: {
      const isDiagnosticCompleted = Boolean(
        user.diagnostic?.isCompleted ??
          metadata.diagnostic_completed ??
          metadata.has_completed_diagnosis ??
          false
      );

      // Si le diagnostic initial (F04) n'a pas encore été complété, orienter vers le diagnostic
      if (!isDiagnosticCompleted) {
        return ROUTES.DASHBOARDS.DIAGNOSTIC;
      }
      return ROUTES.DASHBOARDS.BENEFICIAIRE;
    }
  }
}
