import type { Metadata } from "next";
import { Handshake, Briefcase, FileSpreadsheet } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Partenaire | ACCEENT Mentoring",
  description: "Suivi des cohortes parrainées, publications d'opportunités et rapports d'impact.",
};

export default function PartenaireDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-border shadow-xs">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Espace Partenaire
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-2">
            Tableau de bord Partenaire & Bailleurs
          </h1>
          <p className="text-xs text-muted-foreground">
            Suivi des programmes sponsorisés et publication des opportunités.
          </p>
        </div>
      </div>
    </div>
  );
}
