import type { Metadata } from "next";
import { DiagnosticWizard } from "@/features/diagnosis/DiagnosticWizard";
import { getMyDiagnosticAction } from "@/lib/actions/diagnostic";

export const instant = false;

export const metadata: Metadata = {
  title: "Diagnostic Initial des Compétences & Besoins | ACCEENT Mentoring",
  description:
    "Évaluez vos compétences, vos objectifs et identifiez le mentor idéal grâce à notre algorithme de matching multi-critères.",
};

export default async function DiagnosticPage() {
  const existingDiagnostic = await getMyDiagnosticAction();

  return (
    <div className="max-w-3xl mx-auto py-2">
      <DiagnosticWizard initialDiagnostic={existingDiagnostic} />
    </div>
  );
}
