import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import {
  getMySlotsAction,
  listSessionsAction,
} from "@/lib/actions/sessions";
import { MentorCalendarClient } from "@/features/sessions/MentorCalendarClient";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Agenda & Sessions | Espace Mentor ACCEENT",
  description:
    "Gérez vos créneaux de disponibilité et vos sessions de mentoring.",
};

export default async function MentorCalendarPage() {
  const [slotsRes, sessionsRes] = await Promise.all([
    getMySlotsAction(),
    listSessionsAction(),
  ]);

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
            Agenda &amp; Sessions de mentoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Configurez vos créneaux ouverts aux réservations et pilotez vos
            sessions avec vos mentorés.
          </p>
        </div>

        <Link
          href={ROUTES.MENTOR.PARCOURS}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors self-start sm:self-auto"
        >
          <Users className="h-3.5 w-3.5" />
          <span>Voir mes mentorés</span>
        </Link>
      </div>

      <MentorCalendarClient
        initialSlots={slotsRes.data}
        initialSessions={sessionsRes.data}
      />
    </div>
  );
}
