import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminHeader } from "@/features/administration";
import {
  getPendingValidationsAction,
  getCurrentAdminUserAction,
} from "@/lib/actions/admin";
import { ROUTES } from "@/lib/constants";

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
  const currentUser = await getCurrentAdminUserAction();
  if (!currentUser) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const pendingItems = await getPendingValidationsAction();
  const pendingCount = pendingItems.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop fixe */}
      <AdminSidebar
        pendingCount={pendingCount}
        currentUser={currentUser}
        className="hidden md:flex"
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader pendingCount={pendingCount} currentUser={currentUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
