import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Briefcase, Building, MapPin, Calendar, ExternalLink } from "lucide-react";
import { getPartnerWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Opportunités | Espace Partenaire ACCEENT Mentoring",
  description: "Consultez les opportunités répertoriées sur la plateforme ACCEENT Mentoring.",
};

export default async function PartnerOpportunitiesPage() {
  const data = await getPartnerWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Opportunités Répertoriées
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.opportunities.length} opportunité(s) enregistrée(s) en base de données ({data.activeOpportunitiesCount} active(s)).
        </p>
      </div>

      {data.opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune opportunité enregistrée en base
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les offres d&apos;emploi, bourses et financements publiées apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-3xl bg-white border border-border shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                    {opp.categorie}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {opp.status}
                  </span>
                </div>

                <h2 className="font-bold text-sm text-foreground line-clamp-2">
                  {opp.titre}
                </h2>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{opp.organisation}</span>
                </p>

                {opp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {opp.localisation || "Non spécifié"}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Calendar className="h-3 w-3" />
                    {opp.dateExpiration
                      ? new Date(opp.dateExpiration).toLocaleDateString("fr-FR")
                      : "—"}
                  </span>
                </div>

                {opp.lienCandidature && (
                  <a
                    href={opp.lienCandidature}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <span>Voir l&apos;offre externe</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
