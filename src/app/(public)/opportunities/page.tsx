import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const instant = false;

export const metadata: Metadata = {
  title: "Opportunités | ACCEENT Mentoring",
  description:
    "Découvrez les offres d'emploi, bourses, appels à projets et financements sélectionnés par ACCEENT Mentoring.",
};

interface PublicOpportunityCard {
  id: string;
  titre: string;
  organisation: string;
  categorie: string;
  description: string;
  localisation: string | null;
  typeContrat: string | null;
  lienCandidature: string;
  dateExpiration: string;
  status: string;
}

export default async function PublicOpportunitiesCatalogPage() {
  await connection();
  const adminDb = createAdminClient();

  const { data } = await adminDb
    .from("Opportunity")
    .select(
      "id, titre, organisation, categorie, description, localisation, typeContrat, lienCandidature, dateExpiration, status"
    )
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });

  const opportunities = (data as PublicOpportunityCard[] | null) ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête catalogue */}
      <section className="bg-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Emplois, bourses &amp; financements
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Opportunités sélectionnées pour vous
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Accédez aux appels à candidatures, stages, bourses et programmes
              partenaires ouverts aux membres de la communauté ACCEENT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold">
              {opportunities.length} opportunité
              {opportunities.length > 1 ? "s" : ""} active
              {opportunities.length > 1 ? "s" : ""}
            </div>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-accent text-slate-950 hover:bg-accent/90 transition-colors"
            >
              <span>Rejoindre le programme</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Liste des opportunités */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {opportunities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-4">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Aucune opportunité active pour le moment
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Revenez prochainement ou créez votre compte pour recevoir nos
                nouvelles annonces d&apos;emploi, bourses et appels à projets.
              </p>
            </div>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span>Créer un compte bénéficiaire</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => {
              const safeApplyUrl = sanitizeExternalUrl(opp.lienCandidature);
              const expirationDate = opp.dateExpiration
                ? new Date(opp.dateExpiration).toLocaleDateString("fr-FR")
                : null;

              return (
                <article
                  key={opp.id}
                  className="bg-white rounded-3xl border border-border shadow-xs p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                        {opp.categorie}
                      </span>
                      {opp.typeContrat && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          {opp.typeContrat}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-foreground">
                        {opp.titre}
                      </h2>
                      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          {opp.organisation}
                        </span>
                        {opp.localisation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {opp.localisation}
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
                    {expirationDate ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-secondary" />
                        <span>Date limite : {expirationDate}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {safeApplyUrl ? (
                      <a
                        href={safeApplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <span>Postuler</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={ROUTES.AUTH.LOGIN}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 transition-colors"
                      >
                        <span>Se connecter pour voir</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
