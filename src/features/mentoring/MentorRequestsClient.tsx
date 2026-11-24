"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";

import {
  respondMentorshipRequestAction,
  type MentorshipRequestApiItem,
} from "@/lib/actions/mentoring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MentorRequestsClientProps {
  initialRequests: MentorshipRequestApiItem[];
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ACCEPTED: {
    label: "Acceptée",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Refusée",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  COMPLETED: {
    label: "Terminée",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function MentorRequestsClient({
  initialRequests,
}: MentorRequestsClientProps) {
  const router = useRouter();
  const [requests, setRequests] =
    useState<MentorshipRequestApiItem[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [responseMap, setResponseMap] = useState<Record<string, string>>({});
  const [programTitleMap, setProgramTitleMap] = useState<
    Record<string, string>
  >({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((req) => req.status === filterStatus);

  function handleRespond(
    req: MentorshipRequestApiItem,
    action: "ACCEPT" | "REJECT" | "CLARIFY"
  ) {
    setFeedback(null);
    setActiveId(req.id);
    const responseMessage = responseMap[req.id]?.trim() || undefined;
    const programTitle = programTitleMap[req.id]?.trim() || undefined;

    startTransition(async () => {
      const result = await respondMentorshipRequestAction(req.id, {
        action,
        responseMessage,
        programTitle,
      });

      setActiveId(null);

      if (!result.ok) {
        setFeedback({
          type: "error",
          text:
            result.error ?? "Impossible de traiter cette demande de mentoring.",
        });
        return;
      }

      setRequests((prev) =>
        prev.map((item) => {
          if (item.id !== req.id) return item;
          return {
            ...item,
            status:
              action === "ACCEPT"
                ? "ACCEPTED"
                : action === "REJECT"
                  ? "REJECTED"
                  : "PENDING",
            responseMessage: responseMessage ?? item.responseMessage,
            respondedAt: new Date().toISOString(),
          };
        })
      );

      setFeedback({
        type: "success",
        text:
          action === "ACCEPT"
            ? "Demande acceptée ! Le parcours d'accompagnement a été créé."
            : action === "REJECT"
              ? "Demande refusée et notification envoyée au bénéficiaire."
              : "Demande de précisions transmise au bénéficiaire.",
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"] as const).map(
            (statusKey) => {
              const count =
                statusKey === "ALL"
                  ? requests.length
                  : requests.filter((r) => r.status === statusKey).length;
              const labels: Record<string, string> = {
                ALL: "Toutes",
                PENDING: "En attente",
                ACCEPTED: "Acceptées",
                COMPLETED: "Terminées",
                REJECTED: "Refusées",
              };
              const isSelected = filterStatus === statusKey;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setFilterStatus(statusKey)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                    }`}
                >
                  {labels[statusKey]} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium ${feedback.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-700"
            }`}
        >
          {feedback.text}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <Clock className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune demande dans cette catégorie
          </h2>
          <p className="text-xs text-muted-foreground">
            Les nouvelles demandes adressées par les bénéficiaires s&apos;afficheront
            ici dès leur réception.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const menteeName = req.mentee
              ? `${req.mentee.prenom} ${req.mentee.nom}`.trim()
              : "Bénéficiaire";
            const badge = STATUS_BADGES[req.status] ?? STATUS_BADGES.PENDING;
            const isLoadingThis = isPending && activeId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/70 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">
                        {menteeName}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      Objectif : {req.objectif}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Reçue le{" "}
                      {new Date(req.createdAt).toLocaleDateString("fr-FR")} ·
                      Format : {req.format} · Durée : {req.duree} · Fréquence :{" "}
                      {req.frequence}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-semibold text-foreground">
                      Problématique &amp; contexte
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {req.problematique}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-semibold text-foreground">
                      Message du bénéficiaire
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {req.message}
                    </p>
                  </div>
                </div>

                {req.responseMessage && (
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-foreground flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Votre réponse : </span>
                      <span>{req.responseMessage}</span>
                    </div>
                  </div>
                )}

                {req.status === "PENDING" && (
                  <div className="pt-2 border-t border-border/70 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`title-${req.id}`}
                          className="text-xs font-semibold"
                        >
                          Titre du parcours (si acceptée)
                        </Label>
                        <Input
                          id={`title-${req.id}`}
                          value={programTitleMap[req.id] ?? ""}
                          onChange={(e) =>
                            setProgramTitleMap((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          placeholder={`Parcours : ${req.objectif}`}
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`resp-${req.id}`}
                          className="text-xs font-semibold"
                        >
                          Message / précision au bénéficiaire
                        </Label>
                        <Input
                          id={`resp-${req.id}`}
                          value={responseMap[req.id] ?? ""}
                          onChange={(e) =>
                            setResponseMap((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          placeholder="Ex : Ravi de vous accompagner, réservons un premier créneau..."
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoadingThis}
                        onClick={() => handleRespond(req, "CLARIFY")}
                        className="rounded-full text-xs"
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                        Demander des précisions
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isLoadingThis}
                        onClick={() => handleRespond(req, "REJECT")}
                        className="rounded-full text-xs"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Refuser
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isLoadingThis}
                        onClick={() => handleRespond(req, "ACCEPT")}
                        className="rounded-full text-xs"
                      >
                        {isLoadingThis ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Accepter et ouvrir le parcours
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
