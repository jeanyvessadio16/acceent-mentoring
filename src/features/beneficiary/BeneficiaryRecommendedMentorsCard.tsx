import Link from "next/link";
import { Users, Briefcase, Award, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryRecommendedMentorsCardProps {
  mentors: BeneficiaryDashboardData["recommendedMentors"];
}

export function BeneficiaryRecommendedMentorsCard({
  mentors,
}: BeneficiaryRecommendedMentorsCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Mentors Disponibles pour vous Accompagner
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">
              Profils certifiés
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Professionnels et experts bénévoles prêts à vous mentorer
          </p>
        </div>

        <Link
          href={ROUTES.BENEFICIARY.MENTORS}
          className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
        >
          <span>Voir tout le catalogue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {mentors.length === 0 ? (
        <div className="p-6 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">
            Aucun profil mentor actuellement disponible
          </h4>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Les mentors validés par l&apos;équipe administrative apparaîtront ici dès leur activation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => {
            const initials = `${mentor.prenom?.[0] || ""}${mentor.nom?.[0] || "M"}`.toUpperCase();

            return (
              <div
                key={mentor.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4 hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {mentor.prenom} {mentor.nom}
                        </p>
                        {typeof mentor.scoreTotal === "number" && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent-foreground">
                            ★ {mentor.scoreTotal}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentor.fonction} {mentor.organisation ? `· ${mentor.organisation}` : ""}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {mentor.anneesExperience} ans d&apos;expérience
                      </span>
                    </div>
                  </div>

                  {mentor.justification && (
                    <p className="text-[11px] text-secondary font-medium leading-relaxed">
                      {mentor.justification}
                    </p>
                  )}

                  {/* Badges d'expertises */}
                  {mentor.expertises.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mentor.expertises.slice(0, 3).map((exp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-slate-200 text-slate-700"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={ROUTES.BENEFICIARY.MENTOR_DETAIL(mentor.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <span>Voir le profil mentor</span>
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
