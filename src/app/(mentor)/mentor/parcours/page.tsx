import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

import {
  getMentorshipProgramDetailAction,
  listMentorshipProgramsAction,
} from "@/lib/actions/mentoring";
import { ProgramWorkspaceClient } from "@/features/mentoring/ProgramWorkspaceClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Parcours Accompagnés | Espace Mentor ACCEENT",
  description:
    "Pilotez les parcours de vos mentorés : objectifs SMART, plans d'action et ressources partagées.",
};

export default async function MentorParcoursPage() {
  const programsRes = await listMentorshipProgramsAction("mentor");

  const initialDetail =
    programsRes.data.length > 0
      ? (await getMentorshipProgramDetailAction(programsRes.data[0].id)).data
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/mentor"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord mentor</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Parcours d&apos;accompagnement
          </h1>
          <p className="text-sm text-muted-foreground">
            Définissez les objectifs SMART, assignez des actions concrètes et
            partagez vos ressources avec vos bénéficiaires.
          </p>
        </div>

        <Link
          href={ROUTES.MENTOR.CALENDAR}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors self-start sm:self-auto"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Agenda &amp; Sessions</span>
        </Link>
      </div>

      <ProgramWorkspaceClient
        role="mentor"
        initialPrograms={programsRes.data}
        initialDetail={initialDetail}
      />
    </div>
  );
}
