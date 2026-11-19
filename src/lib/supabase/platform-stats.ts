import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isNextInternalError } from "@/lib/utils/next-errors";
import type { AdminDashboardStats } from "@/types";

export const EMPTY_PLATFORM_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalBeneficiaries: 0,
  totalMentors: 0,
  totalPartners: 0,
  pendingValidations: 0,
  activePrograms: 0,
  completedSessions: 0,
  satisfactionRate: 0,
  demographics: {
    femalePercentage: 0,
    malePercentage: 0,
    ruralPercentage: 0,
    urbanPercentage: 0,
    sdhPercentage: 0,
    averageAge: 0,
  },
};

interface StatsUserRow {
  id: string;
  role: string;
  statutCompte: string;
  sexe: string | null;
  milieuResidence: string | null;
  situationHandicap: boolean;
  age: number | null;
}

/**
 * Calcule les métriques agrégées réelles de la plateforme à partir de PostgreSQL.
 */
export async function computeAggregatedPlatformStats(): Promise<AdminDashboardStats> {
  try {
    const adminDb = createAdminClient();
    const [usersRes, programsRes, completedSessionsRes, ratedSessionsRes] =
      await Promise.all([
        adminDb
          .from("User")
          .select(
            "id, role, statutCompte, sexe, milieuResidence, situationHandicap, age"
          ),
        adminDb
          .from("MentorshipProgram")
          .select("id", { count: "exact", head: true })
          .eq("status", "ACTIVE"),
        adminDb
          .from("MentorshipSession")
          .select("id", { count: "exact", head: true })
          .eq("status", "COMPLETED"),
        adminDb
          .from("MentorshipSession")
          .select("rating")
          .not("rating", "is", null),
      ]);

    if (usersRes.error || !usersRes.data) {
      if (usersRes.error) {
        console.error(
          "Erreur lors de la lecture des utilisateurs :",
          usersRes.error.message
        );
      }
      return EMPTY_PLATFORM_STATS;
    }

    const users = usersRes.data as StatsUserRow[];
    const totalUsers = users.length;
    const totalBeneficiaries = users.filter(
      (u) => u.role === "BENEFICIAIRE"
    ).length;
    const totalMentors = users.filter((u) => u.role === "MENTOR").length;
    const totalPartners = users.filter((u) => u.role === "PARTENAIRE").length;
    const pendingValidations = users.filter(
      (u) =>
        (u.role === "MENTOR" || u.role === "EXPERT") &&
        u.statutCompte === "PENDING"
    ).length;

    const usersWithGender = users.filter((u) => u.sexe);
    const femalesCount = users.filter((u) => u.sexe === "FEMME").length;
    const malesCount = users.filter((u) => u.sexe === "HOMME").length;
    const femalePercentage =
      usersWithGender.length > 0
        ? Math.round((femalesCount / usersWithGender.length) * 100)
        : 0;
    const malePercentage =
      usersWithGender.length > 0
        ? Math.round((malesCount / usersWithGender.length) * 100)
        : 0;

    const usersWithResidence = users.filter((u) => u.milieuResidence);
    const ruralCount = users.filter((u) => u.milieuResidence === "RURAL").length;
    const urbanCount = users.filter((u) => u.milieuResidence === "URBAIN").length;
    const ruralPercentage =
      usersWithResidence.length > 0
        ? Math.round((ruralCount / usersWithResidence.length) * 100)
        : 0;
    const urbanPercentage =
      usersWithResidence.length > 0
        ? Math.round((urbanCount / usersWithResidence.length) * 100)
        : 0;

    const sdhCount = users.filter((u) => u.situationHandicap === true).length;
    const sdhPercentage =
      totalUsers > 0 ? Math.round((sdhCount / totalUsers) * 100) : 0;

    const usersWithAge = users.filter(
      (u) => typeof u.age === "number" && u.age > 0
    );
    const averageAge =
      usersWithAge.length > 0
        ? Math.round(
            usersWithAge.reduce((acc, u) => acc + (u.age || 0), 0) /
              usersWithAge.length
          )
        : 0;

    const ratedRows = ((ratedSessionsRes.data || []) as Array<{ rating: number | null }>).filter(
      (r): r is { rating: number } => typeof r.rating === "number"
    );
    const satisfactionRate =
      ratedRows.length > 0
        ? Math.round(
            (ratedRows.reduce((sum, r) => sum + r.rating, 0) /
              ratedRows.length /
              5) *
              100
          )
        : 0;

    return {
      totalUsers,
      totalBeneficiaries,
      totalMentors,
      totalPartners,
      pendingValidations,
      activePrograms: programsRes.count || 0,
      completedSessions: completedSessionsRes.count || 0,
      satisfactionRate,
      demographics: {
        femalePercentage,
        malePercentage,
        ruralPercentage,
        urbanPercentage,
        sdhPercentage,
        averageAge,
      },
    };
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur computeAggregatedPlatformStats :", err);
    return EMPTY_PLATFORM_STATS;
  }
}
