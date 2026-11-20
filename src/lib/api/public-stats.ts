import "server-only";
import { cacheLife } from "next/cache";
import { getApiBaseUrlFromEnv } from "@/lib/auth/token-utils";

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

interface PublicStatsApiPayload {
  activeMentors?: number;
  activeBeneficiaries?: number;
  activeOpportunities?: number;
  upcomingMasterclasses?: number;
  totalMasterclasses?: number;
}

/**
 * Récupère et met en cache les indicateurs publics réels de la plateforme
 * via l'API NestJS `/dashboards/public-stats`.
 */
export async function getPublicHomeStats(): Promise<PublicHomeStats> {
  "use cache";
  cacheLife("minutes");

  try {
    const res = await fetch(`${getApiBaseUrlFromEnv()}/dashboards/public-stats`);
    if (!res.ok) {
      return EMPTY_PUBLIC_HOME_STATS;
    }

    const data = (await res.json().catch(() => null)) as PublicStatsApiPayload | null;
    if (!data) {
      return EMPTY_PUBLIC_HOME_STATS;
    }

    return {
      activeMentorsCount: data.activeMentors ?? 0,
      beneficiariesCount: data.activeBeneficiaries ?? 0,
      activeOpportunitiesCount: data.activeOpportunities ?? 0,
      masterclassesCount:
        data.totalMasterclasses ?? data.upcomingMasterclasses ?? 0,
    };
  } catch (err) {
    console.error("Erreur getPublicHomeStats :", err);
    return EMPTY_PUBLIC_HOME_STATS;
  }
}
