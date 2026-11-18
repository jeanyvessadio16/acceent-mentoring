import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Espace Bénéficiaire | ACCEENT Mentoring",
  description: "Suivez vos parcours de mentoring, vos rendez-vous et vos opportunités.",
};

export default function BeneficiaireDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête de bienvenue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Espace Bénéficiaire
            </span>
            <h1 className="text-2xl font-bold text-foreground">
              Ravi de vous revoir sur ACCEENT Mentoring !
            </h1>
            <p className="text-sm text-muted-foreground">
              Explorez votre parcours, vos prochaines sessions et vos opportunités dédiées.
            </p>
          </div>

          <Link
            href={ROUTES.DASHBOARDS.DIAGNOSTIC}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <Compass className="h-4 w-4 mr-1.5" />
            Mon diagnostic
          </Link>
        </div>

        {/* Grille des statistiques et actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Mentors accompagnateurs</span>
            <p className="text-3xl font-extrabold text-foreground">1 actif</p>
            <p className="text-xs text-secondary font-semibold">Parcours en cours</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Sessions programmées</span>
            <p className="text-3xl font-extrabold text-foreground">2 à venir</p>
            <p className="text-xs text-muted-foreground">Prochaine : Jeudi à 15h00 GMT</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Progression du parcours</span>
            <p className="text-3xl font-extrabold text-foreground">45%</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-[45%]" />
            </div>
          </div>
        </div>

        {/* Section Mentors recommandés */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Mentors Recommandés pour vous
            </h3>
            <Link
              href={ROUTES.MENTORS_CATALOG}
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              <span>Découvrir tous les mentors</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Basé sur votre secteur et vos objectifs prioritaires identifiés.
          </p>
        </div>
      </div>
    </div>
  );
}
