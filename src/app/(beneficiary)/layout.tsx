import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { BeneficiarySidebar, BeneficiaryHeader } from "@/features/beneficiary";
import { resolveUnauthorizedWorkspaceRedirectAction } from "@/lib/actions/auth";
import { getBeneficiaryDashboardAction } from "@/lib/actions/beneficiary";

export const instant = false;

export const metadata: Metadata = {
  title: "Espace Bénéficiaire | ACCEENT Mentoring",
  description: "Espace personnel d'accompagnement, parcours de mentorat et opportunités professionnelles.",
};

export default async function BeneficiarySpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const data = await getBeneficiaryDashboardAction();

  if (!data) {
    redirect(await resolveUnauthorizedWorkspaceRedirectAction("BENEFICIAIRE"));
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Desktop fixe */}
      <BeneficiarySidebar
        user={data?.user}
        hasCompletedDiagnosis={data?.hasCompletedDiagnosis ?? false}
        className="hidden md:flex"
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <BeneficiaryHeader
          user={data?.user}
          hasCompletedDiagnosis={data?.hasCompletedDiagnosis ?? false}
        />
        <main
          data-dashboard-surface
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
