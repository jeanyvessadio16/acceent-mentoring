import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Briefcase } from "lucide-react";
import { getBeneficiaryDashboardAction } from "@/lib/actions/beneficiary";
import {
  BeneficiaryWelcomeBanner,
  BeneficiaryStatsGrid,
  BeneficiaryActiveParcoursCard,
  BeneficiaryUpcomingSessionsCard,
  BeneficiaryRecommendedMentorsCard,
} from "@/features/beneficiary";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Tableau de Bord Bénéficiaire | ACCEENT Mentoring",
  description: "Suivez vos parcours de mentoring, vos rendez-vous et vos opportunités.",
};

export default async function BeneficiaireDashboardPage() {
  const dashboardData = await getBeneficiaryDashboardAction();

  if (!dashboardData) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      {/* Bannière de bienvenue personnalisée & Alerte diagnostic */}
      <BeneficiaryWelcomeBanner
        user={dashboardData.user}
        hasCompletedDiagnosis={dashboardData.hasCompletedDiagnosis}
        diagnostic={dashboardData.diagnostic}
      />

      {/* Grille des 4 indicateurs réels (Programmes, Rendez-vous, Progression, Sessions) */}
      <BeneficiaryStatsGrid data={dashboardData} />

      {/* Grille principale 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Parcours actif & Mentors recommandés */}
        <div className="lg:col-span-2 space-y-6">
          <BeneficiaryActiveParcoursCard program={dashboardData.activeProgram} />
          <BeneficiaryRecommendedMentorsCard mentors={dashboardData.recommendedMentors} />
        </div>

        {/* Colonne droite (1/3) : Prochains rendez-vous & Raccourcis utiles */}
        <div className="space-y-6">
          <BeneficiaryUpcomingSessionsCard sessions={dashboardData.upcomingSessions} />

          {/* Raccourcis d'apprentissage et opportunités intra-espace */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Ressources & Opportunités
            </h3>

            <div className="space-y-3">
              <Link
                href={ROUTES.BENEFICIARY.OPPORTUNITIES}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Bourses & Financements
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Appels à projets et offres dédiées
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href={ROUTES.BENEFICIARY.MASTERCLASSES}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Masterclasses & Webinaires
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Ateliers thématiques animés par des experts
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-secondary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
