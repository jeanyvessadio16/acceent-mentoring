import type { Metadata } from "next";
import { Briefcase, Plus, Calendar, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRealOpportunitiesAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Gestion des Opportunités | Administration ACCEENT Mentoring",
  description: "Publication et modération des opportunités d'emploi, stages, financements et bourses.",
};

export default async function AdminOpportunitiesPage() {
  const opportunities = await getRealOpportunitiesAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestion des Opportunités Réelles
          </h1>
          <p className="text-sm text-muted-foreground">
            {opportunities.length} opportunité(s) répertoriée(s) en base de données.
          </p>
        </div>

        <Button className="rounded-full bg-primary text-white text-xs font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-1.5" />
          Créer une opportunité
        </Button>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Aucune opportunité enregistrée en base
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les offres d&apos;emploi, bourses et financements publiées par les partenaires et administrateurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700">
                    {opp.categorie}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {opp.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2">
                  {opp.titre}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{opp.organisation}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
