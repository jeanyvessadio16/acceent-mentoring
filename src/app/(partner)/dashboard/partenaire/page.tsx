import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Handshake,
  Briefcase,
  BarChart3,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { getPartnerWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Tableau de Bord Partenaire | ACCEENT Mentoring",
  description: "Suivi des cohortes parrainées, publications d'opportunités et rapports d'impact.",
};

export default async function PartenaireDashboardPage() {
  const data = await getPartnerWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Handshake className="h-3.5 w-3.5" />
            Espace Partenaire &amp; Bailleurs
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {data.user.prenom || "Partenaire"} !
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivi en temps réel des bénéficiaires accompagnés, des opportunités publiées et des indicateurs d&apos;inclusion.
          </p>
        </div>

        <Link
          href={ROUTES.PARTNER.PROFILE}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shrink-0 self-start sm:self-center"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mon profil partenaire</span>
        </Link>
      </div>

      {/* KPIs réels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Opportunités actives
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.activeOpportunitiesCount}
          </p>
          <p className="text-xs text-secondary font-semibold">
            {data.opportunities.length} au total en base
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Bénéficiaires inscrits
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.stats.totalBeneficiaries}
          </p>
          <p className="text-xs text-muted-foreground">
            Sur {data.stats.totalUsers} comptes au total
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Programmes actifs
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.stats.activePrograms}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {data.stats.completedSessions} session(s) terminée(s)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Inclusion Féminine
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.stats.demographics.femalePercentage}%
          </p>
          <p className="text-xs text-muted-foreground">
            Part des femmes dans l&apos;écosystème
          </p>
        </div>
      </div>

      {/* Raccourcis intra-espace */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Navigation rapide Partenaire
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Opportunités & Offres",
              desc: "Consulter les appels à projets, bourses et emplois",
              href: ROUTES.PARTNER.OPPORTUNITIES,
              icon: Briefcase,
              cls: "bg-purple-100 text-purple-700",
            },
            {
              title: "Impact & Indicateurs",
              desc: "Suivre les métriques d'inclusion et parité",
              href: ROUTES.PARTNER.IMPACT,
              icon: BarChart3,
              cls: "bg-secondary/10 text-secondary",
            },
            {
              title: "Mon Profil Partenaire",
              desc: "Mettre à jour vos coordonnées de contact",
              href: ROUTES.PARTNER.PROFILE,
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
