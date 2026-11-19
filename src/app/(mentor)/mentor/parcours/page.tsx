import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles, Mail } from "lucide-react";
import { getMentorWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mes Mentorés & Parcours | Espace Mentor ACCEENT Mentoring",
  description: "Suivez la progression des parcours de vos bénéficiaires.",
};

export default async function MentorParcoursPage() {
  const data = await getMentorWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-secondary" />
          Mes Mentorés &amp; Parcours
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.programs.length} parcours de mentoring associé(s) à votre compte.
        </p>
      </div>

      {data.programs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucun parcours en cours
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Vos programmes d&apos;accompagnement individuels ou collectifs apparaîtront ici dès leur démarrage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">{program.titre}</h2>
                  <p className="text-xs text-muted-foreground">
                    Mentoré : <strong>{program.menteeName}</strong>
                  </p>
                  {program.menteeEmail && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {program.menteeEmail}
                    </p>
                  )}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  {program.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Progression</span>
                  <span className="font-bold text-secondary">{program.progression}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: `${program.progression}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground">Objectifs</span>
                  <p className="text-lg font-bold text-foreground">{program.goalsCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-muted-foreground">Tâches</span>
                  <p className="text-lg font-bold text-foreground">{program.tasksCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
