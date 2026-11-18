import type { Metadata } from "next";
import { Award, Briefcase, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Expert | ACCEENT Mentoring",
  description: "Accompagnements techniques pointus et masterclasses spécialisées.",
};

export default function ExpertDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            Espace Expert
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-2">
            Tableau de bord Expert
          </h1>
          <p className="text-xs text-muted-foreground">
            Interventions thématiques, consultations ponctuelles et animations d&apos;ateliers.
          </p>
        </div>
      </div>
    </div>
  );
}
