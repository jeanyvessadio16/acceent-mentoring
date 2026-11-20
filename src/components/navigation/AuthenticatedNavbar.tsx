import { apiRequest } from "@/lib/api/server-client";
import { getSessionTokens } from "@/lib/auth/session";
import { getDashboardUrl } from "@/lib/utils/auth-redirect";
import { isNextInternalError } from "@/lib/utils/next-errors";
import { Navbar } from "./Navbar";

interface AuthMeNavbarUser {
  prenom?: string | null;
  nom?: string | null;
  role: string;
  statutCompte: string;
  dashboardUrl?: string;
}

async function resolveNavbarUser(): Promise<{
  displayName: string;
  dashboardUrl: string;
} | null> {
  try {
    const { accessToken, refreshToken } = await getSessionTokens();
    if (!accessToken && !refreshToken) {
      return null;
    }

    const res = await apiRequest<AuthMeNavbarUser>("/auth/me");
    if (!res.ok || !res.data) {
      return null;
    }

    const dbUser = res.data;
    if (
      dbUser.statutCompte === "SUSPENDED" ||
      dbUser.statutCompte === "REJECTED"
    ) {
      return null;
    }

    const displayName =
      `${dbUser.prenom || ""} ${dbUser.nom || ""}`.trim() || "Mon espace";
    const dashboardUrl = dbUser.dashboardUrl || getDashboardUrl(dbUser.role);

    return { displayName, dashboardUrl };
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur AuthenticatedNavbar :", err);
    return null;
  }
}

export async function AuthenticatedNavbar() {
  const currentUser = await resolveNavbarUser();
  return <Navbar currentUser={currentUser} />;
}
