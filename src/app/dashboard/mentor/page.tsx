import type { Metadata } from "next";
import Link from "next/link";
import { Users, Calendar, Clock, CheckCircle2, Award, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Mentor | ACCEENT Mentoring",
  description: "Gérez vos mentorés, vos rendez-vous et vos disponibilités d'accompagnement.",
};

export default function MentorDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              <Award className="h-3.5 w-3.5" />
              Espace Mentor Actif
            </span>
            <h1 className="text-2xl font-bold text-foreground">
              Tableau de Bord Mentor
            </h1>
            <p className="text-sm text-muted-foreground">
              Supervisez vos bénéficiaires et vos sessions d&apos;accompagnement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Mentorés actifs</span>
            <p className="text-3xl font-extrabold text-foreground">3 jeunes</p>
            <p className="text-xs text-secondary font-semibold">Capacité : 5 max</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Sessions dispensées</span>
            <p className="text-3xl font-extrabold text-foreground">18 sessions</p>
            <p className="text-xs text-emerald-600 font-semibold">Satisfaction 100%</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Demandes en attente</span>
            <p className="text-3xl font-extrabold text-foreground">1 nouvelle</p>
            <p className="text-xs text-accent font-semibold">Action requise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
