import Link from "next/link";
import { Calendar, Clock, Video, ArrowRight, User } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryUpcomingSessionsCardProps {
  sessions: BeneficiaryDashboardData["upcomingSessions"];
}

export function BeneficiaryUpcomingSessionsCard({
  sessions,
}: BeneficiaryUpcomingSessionsCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground">
            Mes Prochains Rendez-vous
          </h3>
          <p className="text-xs text-muted-foreground">
            Sessions individuelles et points d&apos;étape planifiés
          </p>
        </div>

        {sessions.length > 0 && (
          <Link
            href={ROUTES.BENEFICIARY.SESSIONS}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="p-6 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">
            Aucun rendez-vous à venir
          </h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Dès que vous conviendrez d&apos;une session avec votre mentor, le créneau et le lien de visio apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const startDate = new Date(session.dateDebut);
            const dateStr = startDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "short",
            });
            const timeStr = startDate.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const safeMeetingUrl = sanitizeExternalUrl(session.meetingUrl);

            return (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground block">
                    {session.titre}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {session.mentorName}
                    </span>
                    <span>·</span>
                    <span className="capitalize flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dateStr} à {timeStr}
                    </span>
                  </div>
                </div>

                {safeMeetingUrl ? (
                  <a
                    href={safeMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors shrink-0"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Rejoindre la visio</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium px-3 py-1.5 rounded-full bg-slate-200/60 shrink-0 self-start sm:self-center">
                    Lien en attente
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
