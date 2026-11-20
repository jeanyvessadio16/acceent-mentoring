import type { Metadata } from "next";
import { getPendingValidationsAction } from "@/lib/actions/admin";
import { PendingValidationsTable } from "@/features/administration";

export const instant = false;

export const metadata: Metadata = {
  title: "Modération & Validations | Administration ACCEENT Mentoring",
  description: "File d'attente des dossiers de candidature des mentors et experts.",
};

export default async function AdminValidationsPage() {
  const pendingItems = await getPendingValidationsAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Modération des Mentors & Experts
        </h1>
        <p className="text-sm text-muted-foreground">
          Examinez et validez les profils des professionnels souhaitant accompagner sur la plateforme.
        </p>
      </div>

      <PendingValidationsTable initialItems={pendingItems} showViewAll={false} />
    </div>
  );
}
