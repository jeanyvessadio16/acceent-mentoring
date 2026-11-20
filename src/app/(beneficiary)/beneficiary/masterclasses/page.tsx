import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import {
  getMyMasterclassRegistrationsAction,
  listMasterclassesAction,
} from "@/lib/actions/catalogs";
import { BeneficiaryMasterclassesClient } from "@/features/catalogs/BeneficiaryMasterclassesClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Masterclasses | Espace Bénéficiaire ACCEENT",
  description:
    "Inscrivez-vous aux masterclasses thématiques, accédez aux sessions live et consultez les replays.",
};

export default async function BeneficiaryMasterclassesPage() {
  await connection();
  const [mcRes, regRes] = await Promise.all([
    listMasterclassesAction(),
    getMyMasterclassRegistrationsAction(),
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
          Masterclasses &amp; Ateliers collectifs
        </h1>
        <p className="text-sm text-muted-foreground">
          Participez aux conférences pratiques animées par nos experts et
          visionnez les replays à votre rythme.
        </p>
      </div>

      <BeneficiaryMasterclassesClient
        initialMasterclasses={mcRes.data}
        initialRegistrations={regRes.data}
      />
    </div>
  );
}
