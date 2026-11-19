import Link from "next/link";
import { Sparkles, Compass, CheckCircle2, ArrowRight, UserCheck, Clock } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryActiveParcoursCardProps {
  program: BeneficiaryDashboardData["activeProgram"];
}

export function BeneficiaryActiveParcoursCard({
  program,
}: BeneficiaryActiveParcoursCardProps) {
  if (!program) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              Mon Parcours de Mentoring
            </h3>
            <p className="text-xs text-muted-foreground">
              Accompagnement individuel et feuille de route d&apos;apprentissage
            </p>
          </div>
        </div>

        <div className="p-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            Vous n&apos;avez pas encore de parcours actif
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Trouvez un mentor parmi les professionnels certifiés de la plateforme pour définir vos objectifs et co-construire votre parcours personnalisé.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.BENEFICIARY.MENTORS}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-xs"
            >
              <span>Explorer l&apos;annuaire des mentors</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              {program.titre}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
              En cours
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Accompagné par <strong>{program.mentorName}</strong> {program.mentorTitle ? `(${program.mentorTitle})` : ""}
          </p>
        </div>

        <Link
          href={ROUTES.BENEFICIARY.PARCOURS}
          className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
        >
          <span>Détails</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Avancement global</span>
          <span className="font-bold text-secondary">{program.progression}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-500 rounded-full"
            style={{ width: `${program.progression}%` }}
          />
        </div>
      </div>

      {/* Résumé des indicateurs du parcours */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Objectifs définis</span>
          <p className="text-lg font-bold text-foreground">{program.goalsCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Tâches & Jalons</span>
          <p className="text-lg font-bold text-foreground">{program.tasksCount}</p>
        </div>
      </div>

      <div className="pt-2">
        <Link
          href={ROUTES.BENEFICIARY.PARCOURS}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
        >
          <span>Accéder à mon espace de travail de mentoring</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}
