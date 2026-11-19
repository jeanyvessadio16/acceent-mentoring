import type { Metadata } from "next";
import { DiagnosticWizard } from "@/features/diagnosis/DiagnosticWizard";

export const metadata: Metadata = {
  title: "Diagnostic Initial des Compétences & Besoins | ACCEENT Mentoring",
  description:
    "Évaluez vos compétences, vos objectifs et identifiez le mentor idéal grâce à notre algorithme de matching multi-critères.",
};

export default function DiagnosticPage() {
  return (
    <div className="max-w-3xl mx-auto py-2">
      <DiagnosticWizard />
    </div>
  );
}
