import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { getBeneficiaryDashboardAction } from "@/lib/actions/beneficiary";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mon Parcours de Mentoring | ACCEENT Mentoring",
  description: "Suivez vos jalons, objectifs et devoirs fixés avec votre mentor.",
};

export default async function BeneficiaryParcoursPage() {
  const data = await getBeneficiaryDashboardAction();
  const program = data?.activeProgram;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Mon Parcours d&apos;Accompagnement
        </h1>
        <p className="text-sm text-muted-foreground">
          Feuille de route collaborative avec votre mentor
        </p>
      </div>

      {!program ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucun parcours de mentoring actif
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Pour initier un parcours, complétez votre diagnostic puis formulez une demande auprès d&apos;un mentor recommandé.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.BENEFICIARY.MENTORS}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              <span>Rechercher un mentor</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{program.titre}</h2>
                <p className="text-xs text-muted-foreground">
                  Mentor : <strong>{program.mentorName}</strong>{" "}
                  {program.mentorTitle ? `(${program.mentorTitle})` : ""}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 self-start sm:self-center">
                Progression : {program.progression}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-500 rounded-full"
                style={{ width: `${program.progression}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-muted-foreground font-medium">Objectifs validés</span>
                <p className="text-xl font-bold text-foreground mt-1">{program.goalsCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-muted-foreground font-medium">Tâches prévues</span>
                <p className="text-xl font-bold text-foreground mt-1">{program.tasksCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
