import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { listOpportunitiesAction } from "@/lib/actions/catalogs";
import { OpportunityManagerClient } from "@/features/catalogs/OpportunityManagerClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Mes Opportunités | Espace Partenaire ACCEENT",
  description:
    "Publiez et gérez les opportunités (emplois, stages, financements) proposées par votre organisation.",
};

export default async function PartnerOpportunitiesPage() {
  await connection();
  const oppRes = await listOpportunitiesAction();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/partenaire"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au tableau de bord partenaire</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Opportunités publiées
        </h1>
        <p className="text-sm text-muted-foreground">
          Diffusez vos offres d&apos;emploi, bourses, stages ou appels à projets
          auprès de la communauté ACCEENT.
        </p>
      </div>

      <OpportunityManagerClient initialOpportunities={oppRes.data} />
    </div>
  );
}
