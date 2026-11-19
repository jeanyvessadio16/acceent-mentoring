import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, GraduationCap, Calendar, UserCheck, ArrowRight } from "lucide-react";
import { getExpertWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tableau de Bord Expert | ACCEENT Mentoring",
  description: "Accompagnements techniques pointus et masterclasses spécialisées.",
};

export default async function ExpertDashboardPage() {
  const data = await getExpertWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            <Award className="h-3.5 w-3.5" />
            Espace Expert
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {data.user.prenom || "Expert"} !
          </h1>
          <p className="text-sm text-muted-foreground">
            Interventions thématiques, consultations ponctuelles et animations de masterclasses.
          </p>
        </div>

        <Link
          href={ROUTES.EXPERT.PROFILE}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shrink-0 self-start sm:self-center"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mon profil expert</span>
        </Link>
      </div>

      {/* KPIs réels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Masterclasses répertoriées
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.masterclasses.length}
          </p>
          <p className="text-xs text-secondary font-semibold">
            Ateliers &amp; webinaires thématiques
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Sessions à venir
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.upcomingSessionsCount}
          </p>
          <p className="text-xs text-primary font-semibold">
            Consultations programmées
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Sessions complétées
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.completedSessionsCount}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            Interventions validées
          </p>
        </div>
      </div>

      {/* Raccourcis intra-espace */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Accès rapides Expert
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Masterclasses & Webinaires",
              desc: "Consulter le calendrier des ateliers collectifs",
              href: ROUTES.EXPERT.MASTERCLASSES,
              icon: GraduationCap,
              cls: "bg-secondary/10 text-secondary",
            },
            {
              title: "Mes Sessions d'expertise",
              desc: "Suivre vos interventions et liens visio",
              href: ROUTES.EXPERT.SESSIONS,
              icon: Calendar,
              cls: "bg-purple-100 text-purple-700",
            },
            {
              title: "Mon Profil Expert",
              desc: "Compléter vos compétences et références",
              href: ROUTES.EXPERT.PROFILE,
              icon: UserCheck,
              cls: "bg-emerald-100 text-emerald-700",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${item.cls}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
