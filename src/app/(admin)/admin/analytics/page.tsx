import type { Metadata } from "next";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  Handshake,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAdminStatsAction } from "@/lib/actions/admin";
import {
  DemographicDistributionCard,
  PlatformAnalyticsCharts,
} from "@/features/administration";
import { AdminExportControls } from "@/features/administration/AdminExportControls";

export const instant = false;

export const metadata: Metadata = {
  title: "Mesure d'Impact & Analytics | Administration ACCEENT Mentoring",
  description:
    "Rapports d'impact socio-économique, insertion professionnelle et statistiques d'inclusion.",
};

export default async function AdminAnalyticsPage() {
  const stats = await getAdminStatsAction();

  const kpiCards = [
    {
      label: "Utilisateurs inscrits",
      value: stats.totalUsers.toLocaleString("fr-FR"),
      detail: `${stats.activeUsers ?? 0} actif(s) · +${stats.newUsersLast30Days ?? 0} sur 30j`,
      icon: Users,
      cls: "text-primary bg-primary/10",
    },
    {
      label: "Profils complétés",
      value: (stats.completedProfilesCount ?? 0).toLocaleString("fr-FR"),
      detail: `${stats.activeMentorsCount ?? 0} mentor(s) actif(s) validé(s)`,
      icon: Award,
      cls: "text-secondary bg-secondary/10",
    },
    {
      label: "Matchs & Demandes",
      value: (stats.totalMatchesCount ?? 0).toLocaleString("fr-FR"),
      detail: `${stats.totalRequestsCount ?? 0} demande(s) · ${stats.pendingRequestsCount ?? 0} en attente`,
      icon: Handshake,
      cls: "text-amber-700 bg-amber-100",
    },
    {
      label: "Parcours de mentoring",
      value: `${stats.activePrograms} / ${stats.completedProgramsCount ?? 0}`,
      detail: `Actifs / Terminés · Taux complétion : ${stats.programCompletionRate ?? 0}%`,
      icon: Compass,
      cls: "text-primary bg-primary/10",
    },
    {
      label: "Sessions réalisées",
      value: `${stats.completedSessions} / ${stats.totalSessionsCount ?? 0}`,
      detail: "Sessions clôturées sur le total planifié",
      icon: CheckCircle2,
      cls: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Score de satisfaction",
      value: stats.satisfactionRate > 0 ? `${stats.satisfactionRate}%` : "—",
      detail:
        stats.averageSatisfactionRating != null
          ? `Note moyenne : ${stats.averageSatisfactionRating}/5`
          : "Aucune évaluation enregistrée",
      icon: TrendingUp,
      cls: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Formations & Masterclasses",
      value: (stats.masterclassesCount ?? 0).toLocaleString("fr-FR"),
      detail: `${stats.masterclassRegistrationsCount ?? 0} inscription(s) enregistrée(s)`,
      icon: GraduationCap,
      cls: "text-secondary bg-secondary/10",
    },
    {
      label: "Opportunités publiées",
      value: (stats.totalOpportunitiesCount ?? 0).toLocaleString("fr-FR"),
      detail: `${stats.activeOpportunitiesCount ?? 0} active(s) · ${stats.employmentStageOpportunitiesCount ?? 0} emploi/stage`,
      icon: Briefcase,
      cls: "text-purple-700 bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mesure d&apos;Impact &amp; Statistiques
          </h1>
          <p className="text-sm text-muted-foreground">
            Indicateurs complets (F17) pour le pilotage stratégique et les rapports aux bailleurs de fonds.
          </p>
        </div>

        <AdminExportControls />
      </div>

      {/* Grille complète des KPIs F17 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.cls}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-foreground">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Graphiques analytiques Recharts */}
      <PlatformAnalyticsCharts stats={stats} variant="full" />

      {/* Données d'inclusion démographique */}
      <DemographicDistributionCard demographics={stats.demographics} />
    </div>
  );
}
