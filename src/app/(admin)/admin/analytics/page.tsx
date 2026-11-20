import type { Metadata } from "next";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { getAdminStatsAction } from "@/lib/actions/admin";
import { DemographicDistributionCard } from "@/features/administration";
import { AdminExportControls } from "@/features/administration/AdminExportControls";

export const instant = false;

export const metadata: Metadata = {
  title: "Mesure d'Impact & Analytics | Administration ACCEENT Mentoring",
  description: "Rapports d'impact socio-économique, insertion professionnelle et statistiques d'inclusion.",
};

export default async function AdminAnalyticsPage() {
  const stats = await getAdminStatsAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mesure d&apos;Impact & Statistiques
          </h1>
          <p className="text-sm text-muted-foreground">
            Données agrégées pour le pilotage stratégique et les rapports aux bailleurs de fonds.
          </p>
        </div>

        <AdminExportControls />
      </div>

      {/* Cartes d'indicateurs de performance clés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Parcours actifs</span>
          <p className="text-3xl font-extrabold text-foreground">{stats.activePrograms}</p>
          <p className="text-xs text-secondary font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {stats.totalUsers} utilisateur(s) inscrit(s)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Sessions menées à terme</span>
          <p className="text-3xl font-extrabold text-foreground">{stats.completedSessions}</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sessions validées comme terminées en base
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Score de satisfaction</span>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.satisfactionRate > 0 ? `${stats.satisfactionRate}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.satisfactionRate > 0
              ? "Moyenne réelle des évaluations de sessions"
              : "Aucune évaluation enregistrée"}
          </p>
        </div>
      </div>

      {/* Données d'inclusion démographique */}
      <DemographicDistributionCard demographics={stats.demographics} />
    </div>
  );
}
