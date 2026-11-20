import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { listMentorshipRequestsAction } from "@/lib/actions/mentoring";
import { MentorRequestsClient } from "@/features/mentoring/MentorRequestsClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Demandes de Mentoring | Espace Mentor ACCEENT",
  description:
    "Consultez et traitez les demandes d'accompagnement adressées par les bénéficiaires.",
};

export default async function MentorRequestsPage() {
  const response = await listMentorshipRequestsAction("received");

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
            Demandes de mentoring reçues
          </h1>
          <p className="text-sm text-muted-foreground">
            Acceptez une demande pour ouvrir automatiquement un parcours
            d&apos;accompagnement, ou demandez des précisions.
          </p>
        </div>

        <Link
          href={ROUTES.MENTOR.PARCOURS}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors self-start sm:self-auto"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Accéder aux parcours</span>
        </Link>
      </div>

      <MentorRequestsClient initialRequests={response.data} />
    </div>
  );
}
