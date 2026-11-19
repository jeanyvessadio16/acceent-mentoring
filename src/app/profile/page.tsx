import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Redirection vers Mon Profil | ACCEENT Mentoring",
  description: "Accès direct à votre profil dans votre espace personnel.",
};

export default async function GeneralProfileRedirectPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const normalizedRole = (profile.role || "").toUpperCase();

  switch (normalizedRole) {
    case "ADMIN":
      redirect(ROUTES.ADMIN.PROFILE);
    case "MENTOR":
      redirect(ROUTES.MENTOR.PROFILE);
    case "EXPERT":
      redirect(ROUTES.EXPERT.PROFILE);
    case "PARTNER":
    case "PARTENAIRE":
      redirect(ROUTES.PARTNER.PROFILE);
    case "BENEFICIARY":
    case "BENEFICIAIRE":
    default:
      redirect(ROUTES.BENEFICIARY.PROFILE);
  }
}
