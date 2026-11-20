"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Scale,
  ShieldAlert,
  Sliders,
} from "lucide-react";

import {
  updateAdminReportAction,
  updateMatchingWeightsAction,
  type MatchingWeightsApiData,
  type ReportApiItem,
  type ReportStatusValue,
} from "@/lib/actions/catalogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminModerationClientProps {
  initialReports: ReportApiItem[];
  initialWeights: MatchingWeightsApiData;
}

const REPORT_BADGES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REVIEWED: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISMISSED: "bg-slate-100 text-slate-600 border-slate-200",
};

export function AdminModerationClient({
  initialReports,
  initialWeights,
}: AdminModerationClientProps) {
  const router = useRouter();
  const [reports, setReports] = useState<ReportApiItem[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const [expertiseWeight, setExpertiseWeight] = useState(
    String(initialWeights.expertiseWeight)
  );
  const [objectiveWeight, setObjectiveWeight] = useState(
    String(initialWeights.objectiveWeight)
  );
  const [sectorWeight, setSectorWeight] = useState(
    String(initialWeights.sectorWeight)
  );
  const [availabilityWeight, setAvailabilityWeight] = useState(
    String(initialWeights.availabilityWeight)
  );
  const [languageWeight, setLanguageWeight] = useState(
    String(initialWeights.languageWeight)
  );
  const [formatWeight, setFormatWeight] = useState(
    String(initialWeights.formatWeight)
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredReports =
    statusFilter === "ALL"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const weightSum =
    (Number(expertiseWeight) || 0) +
    (Number(objectiveWeight) || 0) +
    (Number(sectorWeight) || 0) +
    (Number(availabilityWeight) || 0) +
    (Number(languageWeight) || 0) +
    (Number(formatWeight) || 0);

  const isSumValid = weightSum >= 0.99 && weightSum <= 1.01;

  function handleUpdateReport(reportId: string, status: ReportStatusValue) {
    setFeedback(null);
    const adminNotes = notesMap[reportId]?.trim() || undefined;
    startTransition(async () => {
      const res = await updateAdminReportAction(reportId, {
        status,
        adminNotes,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de traiter le signalement.",
        });
        return;
      }
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status, adminNotes: adminNotes ?? r.adminNotes }
            : r
        )
      );
      setFeedback({
        type: "success",
        text: "Signalement mis à jour.",
      });
      router.refresh();
    });
  }

  function handleSaveWeights(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    if (!isSumValid) {
      setFeedback({
        type: "error",
        text: `La somme des pondérations doit être égale à 1.00 (actuellement ${weightSum.toFixed(
          2
        )}).`,
      });
      return;
    }

    startTransition(async () => {
      const res = await updateMatchingWeightsAction({
        expertiseWeight: Number(expertiseWeight),
        objectiveWeight: Number(objectiveWeight),
        sectorWeight: Number(sectorWeight),
        availabilityWeight: Number(availabilityWeight),
        languageWeight: Number(languageWeight),
        formatWeight: Number(formatWeight),
      });

      if (!res.ok) {
        setFeedback({
          type: "error",
          text:
            res.error ?? "Impossible d'enregistrer les pondérations de matching.",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: "Pondérations du moteur de matching enregistrées.",
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Section 1 : Modération des signalements */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Signalements &amp; Modération ({reports.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Examinez les signalements soumis par les utilisateurs et
                consignez vos décisions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["ALL", "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] as const).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    statusFilter === st
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border"
                  }`}
                >
                  {st === "ALL" ? "Tous" : st}
                </button>
              )
            )}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            Aucun signalement dans cette catégorie.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((rep) => {
              const badgeClass =
                REPORT_BADGES[rep.status] ?? REPORT_BADGES.PENDING;
              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl border border-border/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          Cible : {rep.targetType} ({rep.targetId})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Signalé par :{" "}
                        {rep.reporter
                          ? `${rep.reporter.prenom} ${rep.reporter.nom} (${rep.reporter.email})`
                          : rep.reporterId}
                        {rep.reportedUser
                          ? ` · Utilisateur concerné : ${rep.reportedUser.prenom} ${rep.reportedUser.nom}`
                          : ""}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(rep.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  <p className="p-3 rounded-xl bg-slate-50 text-xs text-foreground">
                    {rep.motif}
                  </p>

                  {rep.adminNotes && (
                    <p className="text-xs text-primary font-medium">
                      Note modération : {rep.adminNotes}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <Input
                      value={notesMap[rep.id] ?? rep.adminNotes ?? ""}
                      onChange={(e) =>
                        setNotesMap((prev) => ({
                          ...prev,
                          [rep.id]: e.target.value,
                        }))
                      }
                      placeholder="Ajouter une note de suivi administratif..."
                      className="h-8 rounded-xl text-xs flex-1"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {(["REVIEWED", "RESOLVED", "DISMISSED"] as const).map(
                        (nextStatus) => (
                          <Button
                            key={nextStatus}
                            type="button"
                            variant={
                              nextStatus === "RESOLVED" ? "default" : "outline"
                            }
                            size="xs"
                            disabled={isPending}
                            onClick={() =>
                              handleUpdateReport(rep.id, nextStatus)
                            }
                            className="rounded-full"
                          >
                            {nextStatus}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2 : Pondérations du moteur de matching (F05 / F16) */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Pondérations de l&apos;algorithme de matching
              </h2>
              <p className="text-xs text-muted-foreground">
                Ajustez les coefficients utilisés lors des recommandations
                automatiques (somme totale requise = 1.00).
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isSumValid
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Somme : {weightSum.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-exp">Expertises (ex: 0.30)</Label>
              <Input
                id="w-exp"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={expertiseWeight}
                onChange={(e) => setExpertiseWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-obj">Objectifs (ex: 0.25)</Label>
              <Input
                id="w-obj"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={objectiveWeight}
                onChange={(e) => setObjectiveWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-sec">Secteur (ex: 0.15)</Label>
              <Input
                id="w-sec"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={sectorWeight}
                onChange={(e) => setSectorWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-avail">Disponibilités (ex: 0.10)</Label>
              <Input
                id="w-avail"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={availabilityWeight}
                onChange={(e) => setAvailabilityWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-lang">Langues (ex: 0.10)</Label>
              <Input
                id="w-lang"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={languageWeight}
                onChange={(e) => setLanguageWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-fmt">Format de mentoring (ex: 0.10)</Label>
              <Input
                id="w-fmt"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatWeight}
                onChange={(e) => setFormatWeight(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !isSumValid}
              className="rounded-full px-6"
            >
              {isPending && (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              )}
              Enregistrer les pondérations
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
