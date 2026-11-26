import type { Metadata } from "next";
import {
  getAdminStatsAction,
  getPendingValidationsAction,
  getRecentAdminActivitiesAction,
} from "@/lib/actions/admin";
import {
  AdminStatsGrid,
  DemographicDistributionCard,
  PendingValidationsTable,
  PlatformAnalyticsCharts,
  RecentActivityFeed,
  QuickAdminActions,
} from "@/features/administration";

export const instant = false;

export const metadata: Metadata = {
  title: "Tableau de Bord Administrateur | ACCEENT Mentoring",
  description: "Vue d'ensemble des indicateurs de performance, validations et suivi d'impact de la plateforme.",
};

export default async function AdminDashboardPage() {
  // Récupération des données via Server Actions
  const [stats, pendingValidations, recentActivities] = await Promise.all([
    getAdminStatsAction(),
    getPendingValidationsAction(),
    getRecentAdminActivitiesAction(),
  ]);

  return (
    <div className="space-y-6">
      {/* Grille des 4 KPIs principaux */}
      <AdminStatsGrid stats={stats} />

      {/* Synthèse graphique Recharts */}
      <PlatformAnalyticsCharts stats={stats} variant="compact" />

      {/* Carte d'Inclusion & Diversité (Parité, Ruralité, SDH, Âge) */}
      <DemographicDistributionCard demographics={stats.demographics} />

      {/* Grille 2 colonnes : Validations & Flux d'activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : File des candidatures en attente */}
        <div className="lg:col-span-2 space-y-6">
          <PendingValidationsTable initialItems={pendingValidations} />
        </div>

        {/* Colonne droite (1/3) : Actions rapides & Activités récentes */}
        <div className="space-y-6">
          <QuickAdminActions />
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
