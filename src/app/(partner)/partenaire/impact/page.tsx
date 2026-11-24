import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { getPartnerWorkspaceDataAction } from "@/lib/actions/workspace";
import {
  DemographicDistributionCard,
  PlatformAnalyticsCharts,
} from "@/features/administration";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Impact & Indicateurs | Espace Partenaire ACCEENT Mentoring",
  description: "Indicateurs réels d'impact, inclusion démographique et insertion.",
};

export default async function PartnerImpactPage() {
  const data = await getPartnerWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-secondary" />
          Impact &amp; Indicateurs Réels
        </h1>
        <p className="text-sm text-muted-foreground">
          Données agrégées issues de la base PostgreSQL pour le suivi des programmes et bailleurs.
        </p>
      </div>

      {/* Compteurs réels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Bénéficiaires inscrits
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.totalBeneficiaries}
          </p>
          <p className="text-xs text-muted-foreground">Comptes bénéficiaires réels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Mentors engagés
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.totalMentors}
          </p>
          <p className="text-xs text-muted-foreground">Comptes mentors réels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Programmes actifs
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.activePrograms}
          </p>
          <p className="text-xs text-secondary font-semibold">Parcours en cours</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Sessions réalisées
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.completedSessions}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">Sessions terminées</p>
        </div>
      </div>

      {/* Graphiques d'impact Recharts */}
      <PlatformAnalyticsCharts
        stats={stats}
        variant="compact"
        showInclusionChart
      />

      {/* Inclusion démographique réelle */}
      <DemographicDistributionCard demographics={stats.demographics} />
    </div>
  );
}
