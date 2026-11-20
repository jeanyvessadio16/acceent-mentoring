import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import {
  getMyOpportunityFavoritesAction,
  listOpportunitiesAction,
} from "@/lib/actions/catalogs";
import { BeneficiaryOpportunitiesClient } from "@/features/catalogs/BeneficiaryOpportunitiesClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Opportunités | Espace Bénéficiaire ACCEENT",
  description:
    "Explorez les emplois, stages, bourses, financements et appels à projets sélectionnés pour vous.",
};

export default async function BeneficiaryOpportunitiesPage() {
  await connection();
  const [oppRes, favRes] = await Promise.all([
    listOpportunitiesAction(),
    getMyOpportunityFavoritesAction(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/beneficiaire"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au tableau de bord</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Catalogue des Opportunités
        </h1>
        <p className="text-sm text-muted-foreground">
          Filtrez les offres d&apos;emploi, stages, formations, bourses et
          financements, et sauvegardez vos favoris.
        </p>
      </div>

      <BeneficiaryOpportunitiesClient
        initialOpportunities={oppRes.data}
        initialFavorites={favRes.data}
      />
    </div>
  );
}
