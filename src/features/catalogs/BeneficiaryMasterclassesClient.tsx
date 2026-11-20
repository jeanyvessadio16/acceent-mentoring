"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  PlayCircle,
  Search,
  Video,
} from "lucide-react";

import {
  getMasterclassAccessAction,
  registerMasterclassAction,
  unregisterMasterclassAction,
  type MasterclassApiItem,
  type MasterclassRegistrationApiItem,
} from "@/lib/actions/catalogs";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BeneficiaryMasterclassesClientProps {
  initialMasterclasses: MasterclassApiItem[];
  initialRegistrations: MasterclassRegistrationApiItem[];
}

export function BeneficiaryMasterclassesClient({
  initialMasterclasses,
  initialRegistrations,
}: BeneficiaryMasterclassesClientProps) {
  const router = useRouter();
  const [masterclasses] =
    useState<MasterclassApiItem[]>(initialMasterclasses);
  const [registeredIds, setRegisteredIds] = useState<string[]>(
    initialRegistrations.map((r) => r.masterclassId)
  );
  const [accessMap, setAccessMap] = useState<
    Record<string, { lienLive: string | null; lienReplay: string | null }>
  >({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = masterclasses.filter((mc) => {
    const matchesStatus =
      statusFilter === "ALL" || mc.statut === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      mc.titre.toLowerCase().includes(q) ||
      mc.intervenant.toLowerCase().includes(q) ||
      mc.categorie.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleRegister(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await registerMasterclassAction(id);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de vous inscrire.",
        });
        return;
      }
      setRegisteredIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setFeedback({
        type: "success",
        text: "Inscription confirmée à la masterclass !",
      });
      router.refresh();
    });
  }

  function handleUnregister(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await unregisterMasterclassAction(id);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de vous désinscrire.",
        });
        return;
      }
      setRegisteredIds((prev) => prev.filter((item) => item !== id));
      setFeedback({ type: "success", text: "Désinscription confirmée." });
      router.refresh();
    });
  }

  function handleLoadAccess(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await getMasterclassAccessAction(id);
      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text:
            res.error ??
            "Impossible de récupérer les liens d'accès pour le moment.",
        });
        return;
      }
      setAccessMap((prev) => ({
        ...prev,
        [id]: {
          lienLive: res.data!.lienLive,
          lienReplay: res.data!.lienReplay,
        },
      }));
    });
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-border p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par thème, titre ou intervenant..."
            aria-label="Rechercher une masterclass"
            className="pl-9 rounded-xl h-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrer par statut"
          className="h-9 rounded-xl border border-input bg-white px-3 text-xs font-medium"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="UPCOMING">À venir</option>
          <option value="LIVE">En direct</option>
          <option value="COMPLETED">Replay disponible</option>
        </select>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <GraduationCap className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune masterclass disponible
          </h2>
          <p className="text-xs text-muted-foreground">
            Revenez bientôt pour découvrir les prochaines sessions thématiques
            animées par nos experts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((mc) => {
            const isRegistered = registeredIds.includes(mc.id);
            const loadedLinks = accessMap[mc.id];
            const safeLiveUrl = sanitizeExternalUrl(
              loadedLinks?.lienLive ?? mc.lienLive
            );
            const safeReplayUrl = sanitizeExternalUrl(
              loadedLinks?.lienReplay ?? mc.lienReplay
            );

            return (
              <article
                key={mc.id}
                className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                      {mc.categorie}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isRegistered && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Inscrit
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {mc.statut}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground">
                      {mc.titre}
                    </h2>
                    <p className="text-xs font-semibold text-secondary">
                      Animée par {mc.intervenant}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {mc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(mc.dateSession).toLocaleString("fr-FR")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {mc.duree} min
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
                  {isRegistered ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {!loadedLinks && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleLoadAccess(mc.id)}
                            className="rounded-full text-xs"
                          >
                            {isPending && (
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            )}
                            Accéder au live / replay
                          </Button>
                        )}
                        {safeLiveUrl && (
                          <a
                            href={safeLiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Lien Live</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {safeReplayUrl && (
                          <a
                            href={safeReplayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-white hover:bg-secondary/90"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>Voir le Replay</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={isPending}
                        onClick={() => handleUnregister(mc.id)}
                        className="rounded-full"
                      >
                        Se désinscrire
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending || mc.statut === "CANCELLED"}
                      onClick={() => handleRegister(mc.id)}
                      className="rounded-full text-xs ml-auto"
                    >
                      S&apos;inscrire à la masterclass
                    </Button>
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
