import type { Metadata } from "next";
import { Calendar, Compass } from "lucide-react";
import {
  getAdminProgramsAction,
  getAdminSessionsAction,
} from "@/lib/actions/admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Supervision Programmes & Sessions | Administration ACCEENT",
  description:
    "Suivez l'ensemble des parcours de mentoring actifs et des sessions planifiées sur la plateforme.",
};

export default async function AdminSupervisionPage() {
  const [programs, sessions] = await Promise.all([
    getAdminProgramsAction(),
    getAdminSessionsAction(),
  ]);

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Supervision des Programmes &amp; Sessions
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue transversale des parcours mentor/mentoré et du calendrier global des séances (F16).
        </p>
      </div>

      {/* Tableau des parcours */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Parcours de mentoring ({programs.length})
            </h2>
          </div>
        </div>

        {programs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aucun parcours de mentoring enregistré pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2.5 pr-4">Parcours</th>
                  <th className="py-2.5 pr-4">Mentor</th>
                  <th className="py-2.5 pr-4">Bénéficiaire</th>
                  <th className="py-2.5 pr-4">Statut</th>
                  <th className="py-2.5 pr-4">Progression</th>
                  <th className="py-2.5">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {prog.titre}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {prog.mentor.prenom} {prog.mentor.nom}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {prog.mentee.prenom} {prog.mentee.nom}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                        {prog.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-primary">
                      {Math.round(prog.progression)}%
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {prog._count.goals} obj. · {prog._count.tasks} tâches ·{" "}
                      {prog._count.sessions} sess.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tableau des sessions */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            <h2 className="text-base font-bold text-foreground">
              Sessions de mentoring ({sessions.length})
            </h2>
          </div>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aucune session enregistrée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2.5 pr-4">Session</th>
                  <th className="py-2.5 pr-4">Mentor</th>
                  <th className="py-2.5 pr-4">Bénéficiaire</th>
                  <th className="py-2.5 pr-4">Date &amp; Horaire</th>
                  <th className="py-2.5 pr-4">Statut</th>
                  <th className="py-2.5">Évaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      {sess.titre}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {sess.mentor.prenom} {sess.mentor.nom}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {sess.mentee.prenom} {sess.mentee.nom}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(sess.dateDebut).toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {sess.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-foreground">
                      {typeof sess.rating === "number" ? `${sess.rating}/5` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
