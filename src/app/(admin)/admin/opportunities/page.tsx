import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { listManagedOpportunitiesAction } from "@/lib/actions/catalogs";
import { OpportunityManagerClient } from "@/features/catalogs/OpportunityManagerClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestion des Opportunités | Administration ACCEENT",
  description:
    "Créez, modifiez ou archivez les opportunités publiées sur la plateforme ACCEENT.",
};

export default async function AdminOpportunitiesPage() {
  await connection();
  const oppRes = await listManagedOpportunitiesAction();

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-border pb-4">
        <Link
          href={ROUTES.ADMIN.DASHBOARD}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au tableau de bord admin</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Gestion des Opportunités
        </h1>
        <p className="text-sm text-muted-foreground">
          Publiez et supervisez les offres d&apos;emploi, bourses, concours et
          financements accessibles aux bénéficiaires.
        </p>
      </div>

      <OpportunityManagerClient initialOpportunities={oppRes.data} />
    </div>
  );
}
