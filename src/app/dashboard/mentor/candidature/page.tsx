import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Candidature en Cours de Validation | ACCEENT Mentoring",
  description: "Suivez l'état de validation administrative de votre profil mentor.",
};

export default function MentorCandidaturePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-border shadow-sm text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
          <Clock className="h-8 w-8 animate-pulse text-accent" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-slate-800 border border-accent/30">
            Statut : Candidature en cours d&apos;examen
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Dossier soumis avec succès !
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Merci pour votre engagement bénévole. L&apos;équipe administrative d&apos;ACCEENT examine actuellement votre profil professionnel afin de garantir la qualité du mentorat.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span>Étapes de validation :</span>
          </div>
          <ul className="space-y-2 pl-6 list-disc">
            <li>Vérification des expertises et de l&apos;expérience déclarée.</li>
            <li>Conformité avec la charte éthique de mentorat ACCEENT.</li>
            <li>Notification par email sous <strong>24 à 48 heures ouvrées</strong> dès activation de votre espace mentor.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.HOME}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
