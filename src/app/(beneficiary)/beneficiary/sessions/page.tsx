import type { Metadata } from "next";
import { Calendar, Clock, Video, User } from "lucide-react";
import { getBeneficiaryDashboardAction } from "@/lib/actions/beneficiary";

export const metadata: Metadata = {
  title: "Mes Rendez-vous de Mentoring | ACCEENT Mentoring",
  description: "Consultez vos sessions individuelles planifiées et passées.",
};

export default async function BeneficiarySessionsPage() {
  const data = await getBeneficiaryDashboardAction();
  const sessions = data?.upcomingSessions || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Mes Rendez-vous de Mentoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Sessions en visioconférence programmées avec vos mentors
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune session planifiée
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Vos rendez-vous de mentoring apparaîtront ici dès que vous aurez convenu d&apos;un créneau avec votre mentor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const startDate = new Date(session.dateDebut);
            const dateStr = startDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={session.id}
                className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {session.titre}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="h-3.5 w-3.5" />
                      {session.mentorName}
                    </span>
                    <span>·</span>
                    <span className="capitalize flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {timeStr}
                    </span>
                  </div>
                </div>

                {session.meetingUrl ? (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors shrink-0 shadow-xs"
                  >
                    <Video className="h-4 w-4" />
                    <span>Rejoindre la visio</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-4 py-2 rounded-full bg-slate-100 shrink-0 self-start sm:self-center">
                    Lien bientôt disponible
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
