import Link from "next/link";
import { Compass, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryWelcomeBannerProps {
  user: BeneficiaryDashboardData["user"];
  hasCompletedDiagnosis: boolean;
  diagnostic: BeneficiaryDashboardData["diagnostic"];
}

export function BeneficiaryWelcomeBanner({
  user,
  hasCompletedDiagnosis,
  diagnostic,
}: BeneficiaryWelcomeBannerProps) {
  return (
    <div className="space-y-4">
      {/* Carte d'accueil principale */}
      <div className="bg-gradient-to-r from-primary via-slate-900 to-primary text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Espace Bénéficiaire
            </span>

            {hasCompletedDiagnosis ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                Diagnostic validé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
                <AlertCircle className="h-3 w-3" />
                Diagnostic en attente
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bonjour, {user.prenom || "Bénéficiaire"} !
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Bienvenue sur votre espace de progression. Trouvez le mentor idéal, suivez vos jalons d&apos;apprentissage et accédez aux opportunités professionnelles.
          </p>

          {hasCompletedDiagnosis && diagnostic?.objectifPrincipal && (
            <div className="mt-2 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Mon objectif principal{diagnostic.domaine ? ` · ${diagnostic.domaine}` : ""}
              </p>
              <p className="text-xs sm:text-sm font-medium text-white">
                {diagnostic.objectifPrincipal}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alerte si le diagnostic initial n'est pas encore complété */}
      {!hasCompletedDiagnosis && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-accent/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-accent/20 text-accent-foreground shrink-0 mt-0.5">
              <Compass className="h-5 w-5 text-accent" />
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
      )}
    </div>
  );
}
