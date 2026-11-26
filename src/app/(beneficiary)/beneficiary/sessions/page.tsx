import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { listMentorshipProgramsAction } from "@/lib/actions/mentoring";
import { listSessionsAction } from "@/lib/actions/sessions";
import { BeneficiarySessionsClient } from "@/features/sessions/BeneficiarySessionsClient";
import { BookSessionButton } from "@/features/sessions/BookSessionButton";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Mes Rendez-vous | Espace Bénéficiaire ACCEENT",
  description:
    "Consultez vos sessions de mentoring, accédez aux liens visio, reprogrammez ou évaluez vos séances.",
};

export default async function BeneficiarySessionsPage() {
  const [sessionsRes, activeProgramsRes] = await Promise.all([
    listSessionsAction(),
    listMentorshipProgramsAction("mentee", "ACTIVE"),
  ]);
  const primaryActiveProgram = activeProgramsRes.data[0] ?? null;
  const primaryMentorName = primaryActiveProgram?.mentor
    ? `${primaryActiveProgram.mentor.prenom} ${primaryActiveProgram.mentor.nom}`.trim()
    : "votre mentor";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/beneficiaire"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Mes rendez-vous &amp; sessions
          </h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos prochaines séances, rejoignez la visioconférence et
            laissez votre évaluation après chaque échange.
          </p>
        </div>

        {primaryActiveProgram ? (
          <BookSessionButton
            mentorId={primaryActiveProgram.mentorId}
            mentorName={primaryMentorName}
            programId={primaryActiveProgram.id}
          />
        ) : (
          <Link
            href={ROUTES.BENEFICIARY.MENTORS}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors self-start sm:self-auto"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Trouver un mentor (demande requise)</span>
          </Link>
        )}
      </div>

      <BeneficiarySessionsClient initialSessions={sessionsRes.data} />
    </div>
  );
}
