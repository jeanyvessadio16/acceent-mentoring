import { MapPin } from "lucide-react";
import type { AdminDashboardStats } from "@/types";

interface DemographicDistributionCardProps {
  demographics: AdminDashboardStats["demographics"];
}

export function DemographicDistributionCard({
  demographics,
}: DemographicDistributionCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Indicateurs d&apos;Inclusion & Diversité</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
              Impact Sénégal
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Suivi des cibles prioritaires d&apos;insertion (Femmes, Zones Rurales, SDH)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Parité / Inclusion Féminine */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Genre / Parité</span>
            <span className="font-bold text-primary">{demographics.femalePercentage}% Femmes</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-secondary h-full transition-all duration-500"
              style={{ width: `${demographics.femalePercentage}%` }}
              title={`Femmes: ${demographics.femalePercentage}%`}
            />
            <div
              className="bg-primary/40 h-full transition-all duration-500"
              style={{ width: `${demographics.malePercentage}%` }}
              title={`Hommes: ${demographics.malePercentage}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            <span>Femmes : {demographics.femalePercentage}%</span>
            <span>Hommes : {demographics.malePercentage}%</span>
          </div>
        </div>

        {/* Milieu de Résidence */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Milieu de résidence</span>
            <span className="font-bold text-accent">{demographics.ruralPercentage}% Rural</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-accent h-full transition-all duration-500"
              style={{ width: `${demographics.ruralPercentage}%` }}
            />
            <div
              className="bg-primary/30 h-full transition-all duration-500"
              style={{ width: `${demographics.urbanPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-accent" />
              Rural : {demographics.ruralPercentage}%
            </span>
            <span>Urbain : {demographics.urbanPercentage}%</span>
          </div>
        </div>

        {/* Situation de Handicap (SDH) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Situation de Handicap (SDH)</span>
            <span className="font-bold text-emerald-600">{demographics.sdhPercentage}% inclus</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, demographics.sdhPercentage)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Donnée protégée conforme au RGPD & CDP Sénégal.
          </p>
        </div>

        {/* Âge Moyen */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Âge Moyen des Inscrits
          </span>
          <p className="text-2xl font-bold text-foreground">
            {demographics.averageAge > 0 ? `${demographics.averageAge} ans` : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Cœur de cible 18–35 ans (Jeunes diplômés & porteurs de projets)
          </p>
        </div>
      </div>
    </div>
  );
}
