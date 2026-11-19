import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Calendar, Clock, User, Video } from "lucide-react";
import { getExpertWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mes Sessions | Espace Expert ACCEENT Mentoring",
  description: "Consultez vos sessions techniques et interventions individuelles.",
};

export default async function ExpertSessionsPage() {
  const data = await getExpertWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Mes Sessions d&apos;Expertise
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.sessions.length} session(s) enregistrée(s) ({data.upcomingSessionsCount} à venir, {data.completedSessionsCount} terminée(s)).
        </p>
      </div>

      {data.sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune session enregistrée
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Vos consultations et sessions techniques planifiées apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{session.titre}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {session.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {session.menteeName}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(session.dateDebut).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 shrink-0"
                >
                  <Video className="h-4 w-4" />
                  <span>Rejoindre la visio</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
