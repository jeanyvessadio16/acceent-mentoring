import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BeneficiarySidebar, BeneficiaryHeader } from "@/features/beneficiary";
import { getBeneficiaryDashboardAction } from "@/lib/actions/beneficiary";
import { ROUTES } from "@/lib/constants";

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
  const data = await getBeneficiaryDashboardAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
