import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";
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
  description:
    "Suivez vos parcours de mentoring, vos rendez-vous et vos opportunités.",
};

export default async function BeneficiaireDashboardPage() {
  const dashboardData = await getBeneficiaryDashboardAction();

  if (!dashboardData) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const pendingTasks = dashboardData.activeProgram?.tasks ?? [];
  const sharedResources = dashboardData.activeProgram?.resources ?? [];
  const recommendedOpportunities = dashboardData.recommendedOpportunities ?? [];
  const upcomingMasterclasses = dashboardData.upcomingMasterclasses ?? [];

  return (
    <div className="space-y-6">
      {/* Bannière de bienvenue personnalisée & Objectif & Alerte diagnostic */}
      <BeneficiaryWelcomeBanner
        user={dashboardData.user}
        hasCompletedDiagnosis={dashboardData.hasCompletedDiagnosis}
        diagnostic={dashboardData.diagnostic}
      />

      {/* Grille des 4 indicateurs réels (Programmes, Rendez-vous, Progression, Sessions) */}
      <BeneficiaryStatsGrid data={dashboardData} />

      {/* Grille principale 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Parcours actif, Actions/Ressources & Mentors recommandés */}
        <div className="lg:col-span-2 space-y-6">
          <BeneficiaryActiveParcoursCard program={dashboardData.activeProgram} />

          {/* Mes actions & Mes ressources (F13) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Mes actions en cours</span>
                </h3>
                <Link
                  href={ROUTES.BENEFICIARY.PARCOURS}
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  Ouvrir
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Aucune tâche en attente dans votre parcours actif.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {pendingTasks.slice(0, 4).map((task) => (
                    <li
                      key={task.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {task.titre}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.status}
                        {task.echeance
                          ? ` · Échéance : ${new Date(
                              task.echeance
                            ).toLocaleDateString("fr-FR")}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  <span>Mes ressources partagées</span>
                </h3>
                <Link
                  href={ROUTES.BENEFICIARY.PARCOURS}
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  Toutes
                </Link>
              </div>

              {sharedResources.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Les supports et liens partagés par votre mentor apparaîtront ici.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {sharedResources.slice(0, 4).map((res) => (
                    <li
                      key={res.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {res.titre}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {res.type}
                        </p>
                      </div>
                      {res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          <span>Ouvrir</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <BeneficiaryRecommendedMentorsCard
            mentors={dashboardData.recommendedMentors}
          />
        </div>

        {/* Colonne droite (1/3) : Prochains RDV, Opportunités recommandées & Masterclasses à venir */}
        <div className="space-y-6">
          <BeneficiaryUpcomingSessionsCard
            sessions={dashboardData.upcomingSessions}
          />

          {/* Opportunités recommandées (F13) */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-700" />
                <h3 className="text-base font-bold text-foreground">
                  Opportunités recommandées
                </h3>
              </div>
              <Link
                href={ROUTES.BENEFICIARY.OPPORTUNITIES}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>Tout voir</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recommendedOpportunities.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune opportunité active disponible pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                        {opp.categorie}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Expire le{" "}
                        {new Date(opp.dateExpiration).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">
                      {opp.titre}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{opp.organisation}</span>
                      {opp.lienCandidature && (
                        <a
                          href={opp.lienCandidature}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline shrink-0"
                        >
                          Postuler
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Masterclasses à venir (F13) */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                <h3 className="text-base font-bold text-foreground">
                  Masterclasses à venir
                </h3>
              </div>
              <Link
                href={ROUTES.BENEFICIARY.MASTERCLASSES}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>Catalogue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingMasterclasses.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune masterclass programmée pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMasterclasses.map((mc) => (
                  <Link
                    key={mc.id}
                    href={ROUTES.BENEFICIARY.MASTERCLASSES}
                    className="block p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors space-y-1"
                  >
                    <p className="text-xs font-bold text-foreground line-clamp-1">
                      {mc.titre}
                    </p>
                    <p className="text-[11px] text-secondary font-medium">
                      Par {mc.intervenant} · {mc.categorie}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(mc.dateSession).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mc.duree} min
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
