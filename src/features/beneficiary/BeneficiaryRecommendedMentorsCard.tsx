"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  getMatchingRecommendationsAction,
  recalculateMatchingAction,
  type MatchingRecommendationApiItem,
} from "@/lib/actions/mentoring";
import { ROUTES } from "@/lib/constants";
import type { BeneficiaryDashboardData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BeneficiaryRecommendedMentorsCardProps {
  mentors: BeneficiaryDashboardData["recommendedMentors"];
}

function mapRecommendations(
  items: MatchingRecommendationApiItem[]
): BeneficiaryDashboardData["recommendedMentors"] {
  return items.map((m) => ({
    id: m.mentorProfileId,
    mentorId: m.mentorId,
    nom: m.nom,
    prenom: m.prenom,
    fonction: m.fonction,
    organisation: m.organisation,
    expertises: m.expertises ?? [],
    anneesExperience: m.anneesExperience ?? 0,
    isAvailable: true,
    scoreTotal: m.scoreTotal,
    justification: m.justification,
  }));
}

export function BeneficiaryRecommendedMentorsCard({
  mentors: initialMentors,
}: BeneficiaryRecommendedMentorsCardProps) {
  const [mentors, setMentors] =
    useState<BeneficiaryDashboardData["recommendedMentors"]>(initialMentors);
  const [minScore, setMinScore] = useState("");
  const [secteur, setSecteur] = useState("");
  const [langue, setLangue] = useState("");
  const [typesMentoring, setTypesMentoring] = useState<
    "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX" | ""
  >("");
  const [hasFiltered, setHasFiltered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    const parsedScore = minScore ? Number(minScore) : undefined;
    startTransition(async () => {
      const res = await getMatchingRecommendationsAction({
        minScore: parsedScore,
        secteur,
        langue,
        typesMentoring,
      });
      if (!res.ok) {
        setErrorMessage(res.error ?? "Impossible de filtrer les recommandations.");
        return;
      }
      setMentors(mapRecommendations(res.data).slice(0, 6));
      setHasFiltered(true);
    });
  }

  function handleReset() {
    setMinScore("");
    setSecteur("");
    setLangue("");
    setTypesMentoring("");
    setHasFiltered(false);
    setErrorMessage(null);
    setMentors(initialMentors);
  }

  function handleRecalculate() {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await recalculateMatchingAction();
      if (!res.ok) {
        setErrorMessage(res.error ?? "Impossible de recalculer le matching.");
        return;
      }
      setMentors(mapRecommendations(res.data).slice(0, 6));
      setHasFiltered(false);
    });
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Mentors recommandés pour vous
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">
              Profils certifiés
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Professionnels et experts alignés avec votre diagnostic et vos objectifs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleRecalculate}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>Recalculer</span>
          </button>
          <Link
            href={ROUTES.BENEFICIARY.MENTORS}
            className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filtres F05 */}
      <form
        onSubmit={handleFilter}
        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center"
      >
        <select
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          aria-label="Score minimal"
          className="h-8 rounded-xl border border-input bg-white px-2.5 text-xs"
        >
          <option value="">Score : Tous</option>
          <option value="50">Score ≥ 50%</option>
          <option value="70">Score ≥ 70%</option>
          <option value="85">Score ≥ 85%</option>
        </select>

        <Input
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
          placeholder="Secteur..."
          aria-label="Filtrer par secteur"
          className="h-8 rounded-xl text-xs bg-white"
        />

        <Input
          value={langue}
          onChange={(e) => setLangue(e.target.value)}
          placeholder="Langue..."
          aria-label="Filtrer par langue"
          className="h-8 rounded-xl text-xs bg-white"
        />

        <select
          value={typesMentoring}
          onChange={(e) =>
            setTypesMentoring(
              e.target.value as "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX" | ""
            )
          }
          aria-label="Format de mentoring"
          className="h-8 rounded-xl border border-input bg-white px-2.5 text-xs"
        >
          <option value="">Tous formats</option>
          <option value="INDIVIDUEL">Individuel</option>
          <option value="COLLECTIF">Collectif</option>
          <option value="LES_DEUX">Les deux</option>
        </select>

        <div className="flex items-center gap-1.5 justify-end">
          {hasFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={isPending}
              onClick={handleReset}
              title="Réinitialiser les filtres"
              className="rounded-full h-8 px-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="submit"
            size="xs"
            disabled={isPending}
            className="rounded-full h-8 px-3 text-xs flex-1 sm:flex-initial"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            )}
            Filtrer
          </Button>
        </div>
      </form>

      {errorMessage && (
        <p className="text-xs font-medium text-red-600">{errorMessage}</p>
      )}

      {mentors.length === 0 ? (
        <div className="p-6 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">
            {hasFiltered
              ? "Aucun mentor recommandé ne correspond à vos filtres"
              : "Aucun profil mentor actuellement disponible"}
          </h4>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            {hasFiltered
              ? "Élargissez vos critères ou réinitialisez les filtres ci-dessus."
              : "Les mentors validés par l'équipe administrative apparaîtront ici dès leur activation."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => {
            const initials = `${mentor.prenom?.[0] || ""}${mentor.nom?.[0] || "M"}`.toUpperCase();

            return (
              <div
                key={mentor.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4 hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {mentor.prenom} {mentor.nom}
                        </p>
                        {typeof mentor.scoreTotal === "number" && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent-foreground">
                            ★ {mentor.scoreTotal}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {mentor.fonction} {mentor.organisation ? `· ${mentor.organisation}` : ""}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {mentor.anneesExperience} ans d&apos;expérience
                      </span>
                    </div>
                  </div>

                  {mentor.justification && (
                    <p className="text-[11px] text-secondary font-medium leading-relaxed">
                      {mentor.justification}
                    </p>
                  )}

                  {/* Badges d'expertises */}
                  {mentor.expertises.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mentor.expertises.slice(0, 3).map((exp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-slate-200 text-slate-700"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={ROUTES.BENEFICIARY.MENTOR_DETAIL(mentor.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <span>Voir le profil mentor</span>
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
