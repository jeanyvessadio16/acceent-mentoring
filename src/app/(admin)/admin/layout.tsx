import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminSidebar, AdminHeader } from "@/features/administration";
import {
  getPendingValidationsAction,
  getCurrentAdminUserAction,
} from "@/lib/actions/admin";
import { resolveUnauthorizedWorkspaceRedirectAction } from "@/lib/actions/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Administration | ACCEENT Mentoring",
  description: "Console d'administration et de supervision de la plateforme ACCEENT Mentoring.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const currentUser = await getCurrentAdminUserAction();
  if (!currentUser) {
    redirect(await resolveUnauthorizedWorkspaceRedirectAction("ADMIN"));
  }

  const pendingItems = await getPendingValidationsAction();
  const pendingCount = pendingItems.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Desktop fixe */}
      <AdminSidebar
        pendingCount={pendingCount}
        currentUser={currentUser}
        className="hidden md:flex"
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader pendingCount={pendingCount} currentUser={currentUser} />
        <main
          data-dashboard-surface
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
