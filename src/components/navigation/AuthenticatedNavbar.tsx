import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import { getDashboardUrl } from "@/lib/utils/auth-redirect";
import { isNextInternalError } from "@/lib/utils/next-errors";
import { Navbar } from "./Navbar";

export async function AuthenticatedNavbar() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return <Navbar currentUser={null} />;
    }

    const adminDb = createAdminClient();
    const { data: dbUser } = await findDbUserByAuth<{
      id: string;
      prenom: string | null;
      nom: string | null;
      role: string;
      statutCompte: string;
    }>(adminDb, authUser, "id, prenom, nom, role, statutCompte");

    if (
      !dbUser ||
      dbUser.statutCompte === "SUSPENDED" ||
      dbUser.statutCompte === "REJECTED"
    ) {
      return <Navbar currentUser={null} />;
    }

    const displayName =
      `${dbUser.prenom || ""} ${dbUser.nom || ""}`.trim() || "Mon espace";
    const dashboardUrl = getDashboardUrl(dbUser.role);

    return <Navbar currentUser={{ displayName, dashboardUrl }} />;
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur AuthenticatedNavbar :", err);
    return <Navbar currentUser={null} />;
  }
}
