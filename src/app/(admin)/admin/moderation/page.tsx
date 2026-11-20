import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  getMatchingWeightsAction,
  listAdminReportsAction,
} from "@/lib/actions/catalogs";
import { AdminModerationClient } from "@/features/administration/AdminModerationClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Modération & Matching | Administration ACCEENT",
  description:
    "Traitez les signalements utilisateurs et ajustez les pondérations de l'algorithme de matching.",
};

export default async function AdminModerationPage() {
  const [reportsRes, weightsRes] = await Promise.all([
    listAdminReportsAction(),
    getMatchingWeightsAction(),
  ]);

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
          Modération &amp; Paramètres de Matching
        </h1>
        <p className="text-sm text-muted-foreground">
          Supervisez les signalements de la communauté et calibrez les critères
          de mise en relation mentor-bénéficiaire.
        </p>
      </div>

      <AdminModerationClient
        initialReports={reportsRes.data}
        initialWeights={weightsRes.data}
      />
    </div>
  );
}
