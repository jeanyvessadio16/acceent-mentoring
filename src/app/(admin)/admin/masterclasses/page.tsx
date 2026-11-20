import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { listMasterclassesAction } from "@/lib/actions/catalogs";
import { MasterclassManagerClient } from "@/features/catalogs/MasterclassManagerClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestion des Masterclasses | Administration ACCEENT",
  description:
    "Planifiez les masterclasses, suivez les inscriptions et gérez les replays.",
};

export default async function AdminMasterclassesPage() {
  await connection();
  const mcRes = await listMasterclassesAction();

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
          Gestion des Masterclasses
        </h1>
        <p className="text-sm text-muted-foreground">
          Programmez les sessions collectives, suivez les présences et partagez
          les liens live/replay.
        </p>
      </div>

      <MasterclassManagerClient initialMasterclasses={mcRes.data} />
    </div>
  );
}
