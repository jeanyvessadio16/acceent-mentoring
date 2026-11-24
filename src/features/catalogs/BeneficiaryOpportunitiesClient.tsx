"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  Heart,
  MapPin,
  Search,
  Share2,
} from "lucide-react";

import {
  addOpportunityFavoriteAction,
  removeOpportunityFavoriteAction,
  type OpportunityApiItem,
  type OpportunityFavoriteApiItem,
} from "@/lib/actions/catalogs";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Input } from "@/components/ui/input";

interface BeneficiaryOpportunitiesClientProps {
  initialOpportunities: OpportunityApiItem[];
  initialFavorites: OpportunityFavoriteApiItem[];
}

const CATEGORIES = [
  "ALL",
  "EMPLOI",
  "STAGE",
  "FORMATION",
  "CONCOURS",
  "BOURSE",
  "FINANCEMENT",
  "APPEL_PROJETS",
  "EVENEMENT",
] as const;

export function BeneficiaryOpportunitiesClient({
  initialOpportunities,
  initialFavorites,
}: BeneficiaryOpportunitiesClientProps) {
  const router = useRouter();
  const [opportunities] =
    useState<OpportunityApiItem[]>(initialOpportunities);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    initialFavorites.map((f) => f.opportunityId)
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = opportunities.filter((opp) => {
    const matchesCat =
      categoryFilter === "ALL" || opp.categorie === categoryFilter;
    const matchesFav = !favoritesOnly || favoriteIds.includes(opp.id);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      opp.titre.toLowerCase().includes(q) ||
      opp.organisation.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q);
    const loc = locationFilter.trim().toLowerCase();
    const matchesLoc =
      !loc || (opp.localisation ?? "").toLowerCase().includes(loc);
    return matchesCat && matchesFav && matchesSearch && matchesLoc;
  });

  function handleToggleFavorite(id: string) {
    setFeedback(null);
    const isFav = favoriteIds.includes(id);
    startTransition(async () => {
      const res = isFav
        ? await removeOpportunityFavoriteAction(id)
        : await addOpportunityFavoriteAction(id);

      if (!res.ok) {
        setFeedback(
          res.error ?? "Impossible de mettre à jour vos favoris."
        );
        return;
      }

      setFavoriteIds((prev) =>
        isFav ? prev.filter((item) => item !== id) : [...prev, id]
      );
      router.refresh();
    });
  }

  async function handleShare(opp: OpportunityApiItem) {
    const shareUrl =
      sanitizeExternalUrl(opp.lienCandidature) || window.location.href;
    const shareText = `${opp.titre} — ${opp.organisation} (${opp.categorie})`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: opp.titre,
          text: shareText,
          url: shareUrl,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} : ${shareUrl}`);
      }
      setSharedId(opp.id);
      setTimeout(() => {
        setSharedId((curr) => (curr === opp.id ? null : curr));
      }, 2500);
    } catch {
      // Ignorer l'annulation utilisateur du partage natif
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-border p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="relative sm:col-span-4">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mot-clé, organisation..."
            aria-label="Rechercher une opportunité"
            className="pl-9 rounded-xl h-9"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Catégorie d'opportunité"
            className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "Toutes catégories" : cat}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <Input
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Pays ou ville..."
            aria-label="Filtrer par localisation"
            className="rounded-xl h-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setFavoritesOnly((prev) => !prev)}
          className={`sm:col-span-2 h-9 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
            favoritesOnly
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-white border-input text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              favoritesOnly ? "fill-rose-600 text-rose-600" : ""
            }`}
          />
          <span>Favoris</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {feedback}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <Briefcase className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune opportunité correspondante
          </h2>
          <p className="text-xs text-muted-foreground">
            Ajustez vos critères de recherche ou consultez l&apos;ensemble du
            catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((opp) => {
            const isFav = favoriteIds.includes(opp.id);
            const safeApplyUrl = sanitizeExternalUrl(opp.lienCandidature);

            return (
              <article
                key={opp.id}
                className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                      {opp.categorie}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleFavorite(opp.id)}
                      aria-label={
                        isFav ? "Retirer des favoris" : "Ajouter aux favoris"
                      }
                      className={`p-1.5 rounded-full border transition-colors ${
                        isFav
                          ? "bg-rose-50 border-rose-200 text-rose-600"
                          : "border-border text-muted-foreground hover:text-rose-600"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFav ? "fill-rose-600" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground">
                      {opp.titre}
                    </h2>
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{opp.organisation}</span>
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    {opp.localisation && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {opp.localisation}
                      </span>
                    )}
                    {opp.typeContrat && <span>Contrat : {opp.typeContrat}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Expire le{" "}
                      {new Date(opp.dateExpiration).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => void handleShare(opp)}
                    aria-label={`Partager ${opp.titre}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors"
                  >
                    {sharedId === opp.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Lien copié</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Partager</span>
                      </>
                    )}
                  </button>
                  {safeApplyUrl ? (
                    <a
                      href={safeApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <span>Postuler</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Lien non disponible
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
