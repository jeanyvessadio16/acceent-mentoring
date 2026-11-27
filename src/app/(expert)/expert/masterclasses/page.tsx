import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { listManagedMasterclassesAction } from "@/lib/actions/catalogs";
import { MasterclassManagerClient } from "@/features/catalogs/MasterclassManagerClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Mes Masterclasses | Espace Expert ACCEENT",
  description:
    "Planifiez vos ateliers collectifs, consultez la liste des inscrits et validez les présences.",
};

export default async function ExpertMasterclassesPage() {
  await connection();
  const mcRes = await listManagedMasterclassesAction();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/expert"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au tableau de bord expert</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Masterclasses &amp; Ateliers Expert
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez vos sessions thématiques, partagez le lien de visioconférence et
          suivez l&apos;émargement des participants.
        </p>
      </div>

      <MasterclassManagerClient initialMasterclasses={mcRes.data} />
    </div>
  );
}
