import type { Metadata } from "next";
import Link from "next/link";
import { Compass, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Diagnostic Initial des Compétences & Besoins | ACCEENT Mentoring",
  description: "Évaluez vos compétences, vos objectifs et identifiez le mentor idéal pour votre parcours.",
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-border shadow-sm text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent-foreground border border-accent/30">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Étape 1 sur 2 : Orientation Personnalisée
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Bienvenue ! Réalisez votre diagnostic
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Pour vous recommander les mentors les plus adaptés à votre profil et vos ambitions, complétez ce questionnaire d&apos;orientation rapide (environ 5 minutes).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-primary">1. Situation</span>
            <p className="text-[11px] text-muted-foreground">Votre parcours actuel, études ou projet entrepreneurial</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-secondary">2. Objectifs</span>
            <p className="text-[11px] text-muted-foreground">Vos compétences cibles à développer ou valider</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-xs text-accent">3. Matching</span>
            <p className="text-[11px] text-muted-foreground">Recommandations intelligentes de mentors compatibles</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.DASHBOARDS.BENEFICIAIRE}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-secondary hover:bg-secondary/90 shadow-sm transition-colors"
          >
            <span>Démarrer le diagnostic</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>

          <Link
            href={ROUTES.DASHBOARDS.BENEFICIAIRE}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer cette étape pour le moment
          </Link>
        </div>
      </div>
    </div>
  );
}
