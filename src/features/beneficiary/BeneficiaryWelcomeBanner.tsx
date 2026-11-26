import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryWelcomeBannerProps {
  user: BeneficiaryDashboardData["user"];
  hasCompletedDiagnosis: boolean;
  diagnostic: BeneficiaryDashboardData["diagnostic"];
}

export function BeneficiaryWelcomeBanner({
  hasCompletedDiagnosis,
}: BeneficiaryWelcomeBannerProps) {
  if (hasCompletedDiagnosis) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Compass className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-900">
            Étape recommandée : Complétez votre diagnostic (F04)
          </h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Précisez votre situation, votre projet et vos compétences cibles pour permettre à notre algorithme de vous recommander les mentors les plus adaptés.
          </p>
        </div>
      </div>

      <Link
        href={ROUTES.DASHBOARDS.DIAGNOSTIC}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-slate-950 bg-accent hover:bg-accent/90 shadow-xs transition-colors shrink-0 self-start sm:self-center"
      >
        <span>Démarrer le diagnostic</span>
        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
      </Link>
    </div>
  );
}
