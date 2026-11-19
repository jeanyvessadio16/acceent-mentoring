import type { Metadata } from "next";
import { Briefcase, Building, MapPin, Calendar, ExternalLink } from "lucide-react";
import { getBeneficiaryOpportunitiesAction } from "@/lib/actions/beneficiary";

export const metadata: Metadata = {
  title: "Opportunités | Espace Bénéficiaire ACCEENT Mentoring",
  description: "Offres d'emploi, stages, bourses et financements actifs sur la plateforme.",
};

export default async function BeneficiaryOpportunitiesPage() {
  const opportunities = await getBeneficiaryOpportunitiesAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Opportunités &amp; Financements
        </h1>
        <p className="text-sm text-muted-foreground">
          {opportunities.length} opportunité(s) active(s) sélectionnée(s) pour votre progression professionnelle.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune opportunité active pour le moment
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les offres d&apos;emploi, bourses et appels à projets publiés par nos partenaires apparaîtront ici dès leur mise en ligne.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-3xl bg-white border border-border shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                    {opp.categorie}
                  </span>
                  {opp.typeContrat && (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {opp.typeContrat}
                    </span>
                  )}
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
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <span>Postuler</span>
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
