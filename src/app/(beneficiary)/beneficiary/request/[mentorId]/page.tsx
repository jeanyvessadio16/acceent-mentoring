import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Sparkles } from "lucide-react";

import { getMentorDetailByIdAction } from "@/lib/actions/beneficiary";
import { MentorshipRequestFormClient } from "@/features/mentoring/MentorshipRequestFormClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Nouvelle demande de mentoring | Espace Bénéficiaire ACCEENT Mentoring",
  description:
    "Adressez une demande d'accompagnement structurée à un mentor certifié ACCEENT.",
};

export default async function BeneficiaryMentorRequestPage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const { mentorId } = await params;
  const mentorRecord = await getMentorDetailByIdAction(mentorId);

  if (!mentorRecord) {
    notFound();
  }

  const mentorName =
    `${mentorRecord.prenom} ${mentorRecord.nom}`.trim() || "Mentor ACCEENT";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/beneficiary/mentors/${mentorRecord.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au profil du mentor</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2 border-b border-border pb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Demande d&apos;accompagnement (F07)
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Contacter {mentorName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary shrink-0" />
            <span>
              {mentorRecord.fonction}
              {mentorRecord.organisation
                ? ` · ${mentorRecord.organisation}`
                : ""}
            </span>
          </p>
        </div>

        <MentorshipRequestFormClient
          mentorId={mentorRecord.userId}
          mentorName={mentorName}
          redirectOnSuccess={true}
        />

        <div className="pt-2 text-xs text-muted-foreground">
          Une fois la demande acceptée par le mentor, votre parcours sera
          accessible dans{" "}
          <Link
            href={ROUTES.BENEFICIARY.PARCOURS}
            className="text-primary font-semibold hover:underline"
          >
            Mon Parcours
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
