"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import {
  searchMentorsApiAction,
  type MentorSearchFilter,
  type MentorSearchResultItem,
} from "@/lib/actions/mentoring";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MentorsFilterableCatalogProps {
  initialMentors: MentorSearchResultItem[];
  mode: "beneficiary" | "public";
}

function getMentorDisplay(mentor: MentorSearchResultItem) {
  const prenom = mentor.user?.prenom ?? mentor.prenom ?? "";
  const nom = mentor.user?.nom ?? mentor.nom ?? "";
  const pays = mentor.user?.pays ?? mentor.pays ?? "";
  const fullName = `${prenom} ${nom}`.trim() || "Mentor ACCEENT";
  const initials =
    `${prenom[0] ?? ""}${nom[0] ?? "M"}`.toUpperCase() || "M";
  return { fullName, initials, pays };
}

export function MentorsFilterableCatalog({
  initialMentors,
  mode,
}: MentorsFilterableCatalogProps) {
  const [mentors, setMentors] =
    useState<MentorSearchResultItem[]>(initialMentors);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [secteur, setSecteur] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [langue, setLangue] = useState("");
  const [typesMentoring, setTypesMentoring] = useState<
    "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX" | ""
  >("");
  const [minExperience, setMinExperience] = useState("");
  const [disponibilite, setDisponibilite] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [isPending, startTransition] = useTransition();

  function runSearch(nextFilter: MentorSearchFilter, markFiltered: boolean) {
    setErrorMessage(null);
    startTransition(async () => {
      const response = await searchMentorsApiAction(nextFilter);
      if (!response.ok) {
        setErrorMessage(
          response.error ?? "Erreur lors de la recherche de mentors."
        );
        return;
      }
      setMentors(response.data);
      setHasFiltered(markFiltered);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsedExp = Number(minExperience);
    runSearch(
      {
        search,
        expertise,
        secteur,
        pays,
        ville,
        langue,
        typesMentoring,
        minExperience: Number.isFinite(parsedExp) && parsedExp > 0 ? parsedExp : undefined,
        disponibilite,
        limit: 30,
      },
      true
    );
  }

  function handleReset() {
    setSearch("");
    setExpertise("");
    setSecteur("");
    setPays("");
    setVille("");
    setLangue("");
    setTypesMentoring("");
    setMinExperience("");
    setDisponibilite("");
    setErrorMessage(null);
    setHasFiltered(false);
    setMentors(initialMentors);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>Filtrer les mentors</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {mentors.length} mentor{mentors.length > 1 ? "s" : ""} affiché
            {mentors.length > 1 ? "s" : ""}
            {hasFiltered ? " (résultats filtrés)" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, fonction, organisation, mot-clé..."
              aria-label="Rechercher un mentor"
              className="pl-9 rounded-xl h-9"
            />
          </div>
          <Input
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="Expertise (ex: Finance)"
            aria-label="Filtrer par expertise"
            className="rounded-xl h-9"
          />
          <Input
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
            placeholder="Secteur (ex: Tech, Agro)"
            aria-label="Filtrer par secteur"
            className="rounded-xl h-9"
          />
          <Input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Pays (ex: Sénégal)"
            aria-label="Filtrer par pays"
            className="rounded-xl h-9"
          />
          <Input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ville (ex: Dakar)"
            aria-label="Filtrer par ville"
            className="rounded-xl h-9"
          />
          <Input
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            placeholder="Langue (ex: Français)"
            aria-label="Filtrer par langue"
            className="rounded-xl h-9"
          />
          <select
            value={typesMentoring}
            onChange={(e) =>
              setTypesMentoring(
                e.target.value as "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX" | ""
              )
            }
            aria-label="Format de mentoring"
            className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tous les formats</option>
            <option value="INDIVIDUEL">Mentoring individuel</option>
            <option value="COLLECTIF">Mentoring collectif</option>
            <option value="LES_DEUX">Individuel &amp; Collectif</option>
          </select>
          <Input
            type="number"
            min={0}
            max={60}
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            placeholder="Expérience min (ans)"
            aria-label="Années d'expérience minimum"
            className="rounded-xl h-9"
          />
          <Input
            value={disponibilite}
            onChange={(e) => setDisponibilite(e.target.value)}
            placeholder="Disponibilité (ex: soir, weekend)"
            aria-label="Filtrer par disponibilité"
            className="rounded-xl h-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="rounded-full"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Réinitialiser
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="rounded-full"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 mr-1.5" />
            )}
            Rechercher
          </Button>
        </div>

        {errorMessage && (
          <p className="text-xs font-medium text-red-600">{errorMessage}</p>
        )}
      </form>

      {mentors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            Aucun mentor trouvé
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Aucun profil ne correspond à vos critères actuels. Élargissez vos
            filtres pour découvrir davantage de mentors disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const { fullName, initials, pays: mentorPays } =
              getMentorDisplay(mentor);
            const safePhotoUrl = sanitizeExternalUrl(mentor.photoUrl);
            const detailHref =
              mode === "beneficiary"
                ? `/beneficiary/mentors/${mentor.id}`
                : `/mentors/${mentor.id}`;

            return (
              <article
                key={mentor.id}
                className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden shrink-0">
                  {safePhotoUrl ? (
                    <img
                      src={safePhotoUrl}
                      alt={fullName}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-4xl flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs backdrop-blur-xs ${
                      mentor.isAvailable
                        ? "bg-emerald-50/95 text-emerald-700 border border-emerald-200/80"
                        : "bg-slate-100/95 text-slate-700 border border-slate-200/80"
                    }`}
                  >
                    {mentor.isAvailable
                      ? "Disponible"
                      : "Temporairement indisponible"}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-foreground truncate">
                        {fullName}
                      </h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {mentor.fonction}
                          {mentor.organisation
                            ? ` · ${mentor.organisation}`
                            : ""}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                        {mentorPays && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mentorPays}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3 w-3 text-secondary" />
                          {mentor.anneesExperience ?? 0} ans d&apos;exp.
                        </span>
                      </div>
                    </div>

                    {mentor.biographie && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {mentor.biographie}
                      </p>
                    )}

                    {(mentor.expertises ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(mentor.expertises ?? []).slice(0, 4).map((exp) => (
                          <span
                            key={exp}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/8 text-primary"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}

                    {(mentor.langues ?? []).length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span>{(mentor.langues ?? []).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-secondary">
                      {mentor.typesMentoring === "COLLECTIF"
                        ? "Mentoring collectif"
                        : mentor.typesMentoring === "LES_DEUX"
                        ? "Individuel & Collectif"
                        : "Mentoring individuel"}
                    </span>
                    <div className="flex items-center gap-2">
                      {mode === "beneficiary" && mentor.isAvailable && (
                        <Link
                          href={`/beneficiary/request/${mentor.userId}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                        >
                          Demander
                        </Link>
                      )}
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <span>Voir le profil</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
