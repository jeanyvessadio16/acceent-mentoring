import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, ShieldCheck, CheckCircle2, XCircle, ArrowRight, UserCheck } from "lucide-react";
import { getMentorWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Suivi de Candidature Mentor | ACCEENT Mentoring",
  description: "Suivez l'état de validation administrative de votre profil mentor sans quitter votre espace.",
};

export default async function MentorCandidaturePage() {
  const data = await getMentorWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const status = data.mentorProfile?.statutValidation || "PENDING";
  const isApproved = status === "ACTIVE";
  const isRejected = status === "REJECTED";

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-border shadow-xs text-center space-y-6">
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
            isApproved
              ? "bg-emerald-100 text-emerald-600"
              : isRejected
              ? "bg-red-100 text-red-600"
              : "bg-accent/20 text-accent"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : isRejected ? (
            <XCircle className="h-8 w-8" />
          ) : (
            <Clock className="h-8 w-8 animate-pulse" />
          )}
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-border">
            Statut actuel : {status}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {isApproved
              ? "Votre profil mentor est validé !"
              : isRejected
              ? "Candidature non retenue"
              : "Dossier en cours d'examen"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isApproved
              ? "Félicitations ! Votre profil est désormais visible dans l'annuaire des mentors certifiés et les bénéficiaires peuvent vous solliciter."
              : isRejected
              ? "Votre dossier n'a pas pu être validé en l'état. Mettez à jour votre profil mentor ou contactez l'administration."
              : "Merci pour votre engagement bénévole. L'équipe administrative d'ACCEENT examine votre profil professionnel afin de garantir la qualité du mentorat."}
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
            <li>Activation complète de la réception des demandes de mentorat.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.MENTOR.PROFILE}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
            <span>Compléter mon profil mentor</span>
          </Link>

          <Link
            href={ROUTES.MENTOR.DASHBOARD}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <span>Retour au tableau de bord</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
