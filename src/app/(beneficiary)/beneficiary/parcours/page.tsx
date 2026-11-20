import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import {
  getMentorshipProgramDetailAction,
  listMentorshipProgramsAction,
  listMentorshipRequestsAction,
} from "@/lib/actions/mentoring";
import { ProgramWorkspaceClient } from "@/features/mentoring/ProgramWorkspaceClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Mon Parcours de Mentoring | Espace Bénéficiaire ACCEENT",
  description:
    "Suivez vos demandes de mentoring, vos objectifs SMART, vos tâches et vos ressources partagées.",
};

export default async function BeneficiaryParcoursPage() {
  const [programsRes, requestsRes] = await Promise.all([
    listMentorshipProgramsAction("mentee"),
    listMentorshipRequestsAction("sent"),
  ]);

  const initialDetail =
    programsRes.data.length > 0
      ? (await getMentorshipProgramDetailAction(programsRes.data[0].id)).data
      : null;

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
            Mes parcours de mentoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez vos demandes envoyées et avancez sur vos objectifs, actions
            et ressources partagées avec vos mentors.
          </p>
        </div>

        <Link
          href={ROUTES.BENEFICIARY.MENTORS}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors self-start sm:self-auto"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Trouver un mentor</span>
        </Link>
      </div>

      <ProgramWorkspaceClient
        role="mentee"
        initialPrograms={programsRes.data}
        initialDetail={initialDetail}
        sentRequests={requestsRes.data}
      />
    </div>
  );
}
