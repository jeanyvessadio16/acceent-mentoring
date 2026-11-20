import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getAdminStatsAction, getRealUsersListAction } from "@/lib/actions/admin";
import { AdminUsersTable } from "@/features/administration";

export const instant = false;

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs | Administration ACCEENT Mentoring",
  description: "Annuaire et gestion complète des comptes réels de la plateforme.",
};

export default async function AdminUsersPage() {
  const [stats, realUsers] = await Promise.all([
    getAdminStatsAction(),
    getRealUsersListAction(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Annuaire des Utilisateurs Inscrits
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.totalUsers} compte(s) enregistré(s) en base de données ({stats.totalBeneficiaries} bénéficiaire(s), {stats.totalMentors} mentor(s), {stats.pendingValidations} en attente).
          </p>
        </div>
      </div>

      {/* Table interactive et synchronisée avec Supabase Auth & PostgreSQL */}
      <AdminUsersTable initialUsers={realUsers} />
    </div>
  );
}
