"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Flag, History, Loader2, X } from "lucide-react";

import {
  createReportAction,
  listMyReportsAction,
  type ReportApiItem,
} from "@/lib/actions/catalogs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  REVIEWED: "En cours d'examen",
  RESOLVED: "Résolu",
  DISMISSED: "Classé sans suite",
};

interface ReportModalButtonProps {
  reportedUserId?: string;
  targetType: string;
  targetId: string;
  label?: string;
}

export function ReportModalButton({
  reportedUserId,
  targetType,
  targetId,
  label = "Signaler",
}: ReportModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<"create" | "history">("create");
  const [myReports, setMyReports] = useState<ReportApiItem[]>([]);
  const [motif, setMotif] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleShowHistory() {
    setActiveView("history");
    setErrorMessage(null);
    startTransition(async () => {
      const res = await listMyReportsAction();
      if (!res.ok) {
        setErrorMessage(res.error ?? "Impossible de charger vos signalements.");
        return;
      }
      setMyReports(res.data);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!motif.trim()) {
      setErrorMessage("Merci de préciser le motif de votre signalement.");
      return;
    }

    startTransition(async () => {
      const res = await createReportAction({
        reportedUserId,
        targetType,
        targetId,
        motif: motif.trim(),
      });

      if (!res.ok) {
        setErrorMessage(
          res.error ?? "Impossible d'envoyer ce signalement."
        );
        return;
      }

      setSuccessMessage(
        "Signalement transmis à l'équipe de modération ACCEENT."
      );
      setMotif("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setActiveView("create");
          setErrorMessage(null);
          setSuccessMessage(null);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="bg-white rounded-3xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2
                  id="report-modal-title"
                  className="text-base font-bold text-foreground"
                >
                  Signaler un comportement ou contenu
                </h2>
                <p className="text-xs text-muted-foreground">
                  Votre signalement sera examiné de façon confidentielle par
                  l&apos;administration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-1 rounded-full text-muted-foreground hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveView("create");
                  setErrorMessage(null);
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                  activeView === "create"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                Nouveau signalement
              </button>
              <button
                type="button"
                onClick={handleShowHistory}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold transition-colors ${
                  activeView === "history"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Mes signalements</span>
              </button>
            </div>

            {activeView === "history" ? (
              <div className="space-y-3">
                {isPending ? (
                  <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement de vos signalements...</span>
                  </div>
                ) : errorMessage ? (
                  <p className="text-xs font-medium text-red-600">
                    {errorMessage}
                  </p>
                ) : myReports.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Vous n&apos;avez soumis aucun signalement pour le moment.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {myReports.map((rep) => (
                      <li
                        key={rep.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-border space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {rep.targetType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-border">
                            {REPORT_STATUS_LABELS[rep.status] || rep.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {rep.motif}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-full"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="report-motif">Motif du signalement *</Label>
                  <textarea
                    id="report-motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={4}
                    required
                    placeholder="Décrivez précisément la situation observée..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs font-medium text-red-600">
                    {errorMessage}
                  </p>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-full"
                  >
                    Fermer
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isPending}
                    className="rounded-full"
                  >
                    {isPending && (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    )}
                    Envoyer le signalement
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
