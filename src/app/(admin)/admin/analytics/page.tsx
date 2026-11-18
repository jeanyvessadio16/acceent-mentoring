import type { Metadata } from "next";
import { BarChart3, Download, Users, TrendingUp, CheckCircle2, Award } from "lucide-react";
import { getAdminStatsAction } from "@/lib/actions/admin";
import { DemographicDistributionCard } from "@/features/administration";
import { Button } from "@/components/ui/button";

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

        <Button variant="outline" className="rounded-full text-xs font-semibold h-10 px-4 border-primary/30 text-primary hover:bg-primary/5">
          <Download className="h-4 w-4 mr-1.5" />
          Exporter rapport trimestriel (PDF/CSV)
        </Button>
      </div>

      {/* Cartes d'indicateurs de performance clés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Taux de rétention</span>
          <p className="text-3xl font-extrabold text-foreground">91.4%</p>
          <p className="text-xs text-secondary font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            +4.2% par rapport au trimestre précédent
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Sessions menées à terme</span>
          <p className="text-3xl font-extrabold text-foreground">{stats.completedSessions}</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            94% d&apos;assiduité globale observée
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Score de satisfaction</span>
          <p className="text-3xl font-extrabold text-foreground">{stats.satisfactionRate}%</p>
          <p className="text-xs text-muted-foreground">
            Évaluations certifiées post-parcours
          </p>
        </div>
      </div>

      {/* Données d'inclusion démographique */}
      <DemographicDistributionCard demographics={stats.demographics} />
    </div>
  );
}
