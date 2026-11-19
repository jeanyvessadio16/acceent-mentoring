import "server-only";
import { cacheLife } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicHomeStats {
  activeMentorsCount: number;
  beneficiariesCount: number;
  activeOpportunitiesCount: number;
  masterclassesCount: number;
}

const EMPTY_PUBLIC_HOME_STATS: PublicHomeStats = {
  activeMentorsCount: 0,
  beneficiariesCount: 0,
  activeOpportunitiesCount: 0,
  masterclassesCount: 0,
};

/**
 * Récupère et met en cache les indicateurs publics réels de la plateforme
 * pour la page d'accueil.
 */
export async function getPublicHomeStats(): Promise<PublicHomeStats> {
  "use cache";
  cacheLife("minutes");

  try {
    const adminDb = createAdminClient();
    const [mentorsRes, beneficiariesRes, opportunitiesRes, masterclassesRes] =
      await Promise.all([
        adminDb
          .from("MentorProfile")
          .select("id", { count: "exact", head: true })
          .eq("statutValidation", "ACTIVE"),
        adminDb
          .from("User")
          .select("id", { count: "exact", head: true })
          .eq("role", "BENEFICIAIRE")
          .eq("statutCompte", "ACTIVE"),
        adminDb
          .from("Opportunity")
          .select("id", { count: "exact", head: true })
          .eq("status", "ACTIVE"),
        adminDb
          .from("Masterclass")
          .select("id", { count: "exact", head: true }),
      ]);

    return {
      activeMentorsCount: mentorsRes.count || 0,
      beneficiariesCount: beneficiariesRes.count || 0,
      activeOpportunitiesCount: opportunitiesRes.count || 0,
      masterclassesCount: masterclassesRes.count || 0,
    };
  } catch (err) {
    console.error("Erreur getPublicHomeStats :", err);
    return EMPTY_PUBLIC_HOME_STATS;
  }
}
