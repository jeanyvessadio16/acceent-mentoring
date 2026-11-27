"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Star,
  Video,
  XCircle,
} from "lucide-react";

import {
  cancelSessionAction,
  rescheduleSessionAction,
  submitSessionFeedbackAction,
  type MentorshipSessionApiItem,
} from "@/lib/actions/sessions";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SessionsScheduleCalendar } from "./SessionsScheduleCalendar";

interface BeneficiarySessionsClientProps {
  initialSessions: MentorshipSessionApiItem[];
}

const SESSION_BADGES: Record<string, { label: string; className: string }> = {
  SCHEDULED: {
    label: "Planifiée",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RESCHEDULED: {
    label: "Reprogrammée",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  COMPLETED: {
    label: "Terminée",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export function BeneficiarySessionsClient({
  initialSessions,
}: BeneficiarySessionsClientProps) {
  const router = useRouter();
  const [sessions, setSessions] =
    useState<MentorshipSessionApiItem[]>(initialSessions);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(
    null
  );
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("10:00");
  const [rescheduleEnd, setRescheduleEnd] = useState("11:00");
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered =
    statusFilter === "ALL"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  function handleCancel(sessionId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelSessionAction(sessionId);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible d'annuler cette session.",
        });
        return;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "CANCELLED" } : s
        )
      );
      setFeedback({ type: "success", text: "Session annulée." });
      router.refresh();
    });
  }

  function handleReschedule(
    e: React.FormEvent<HTMLFormElement>,
    sessionId: string
  ) {
    e.preventDefault();
    setFeedback(null);
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) return;

    const startIso = new Date(`${rescheduleDate}T${rescheduleStart}:00`);
    const endIso = new Date(`${rescheduleDate}T${rescheduleEnd}:00`);
    if (
      Number.isNaN(startIso.getTime()) ||
      Number.isNaN(endIso.getTime()) ||
      endIso <= startIso
    ) {
      setFeedback({
        type: "error",
        text: "L'heure de fin doit être postérieure à l'heure de début.",
      });
      return;
    }

    startTransition(async () => {
      const res = await rescheduleSessionAction(sessionId, {
        dateDebut: startIso.toISOString(),
        dateFin: endIso.toISOString(),
      });
      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de reprogrammer cette session.",
        });
        return;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "RESCHEDULED",
                dateDebut: res.data!.dateDebut,
                dateFin: res.data!.dateFin,
              }
            : s
        )
      );
      setRescheduleTargetId(null);
      setRescheduleDate("");
      setFeedback({ type: "success", text: "Session reprogrammée." });
      router.refresh();
    });
  }

  function handleSubmitFeedback(
    e: React.FormEvent<HTMLFormElement>,
    sessionId: string
  ) {
    e.preventDefault();
    setFeedback(null);
    const rating = ratingMap[sessionId] ?? 5;
    const text = feedbackMap[sessionId]?.trim() || undefined;

    startTransition(async () => {
      const res = await submitSessionFeedbackAction(sessionId, {
        rating,
        feedback: text,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible d'envoyer votre évaluation.",
        });
        return;
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                rating,
                feedbackMentee: text ?? s.feedbackMentee ?? s.feedback ?? null,
                feedback: text ?? s.feedbackMentee ?? s.feedback ?? null,
              }
            : s
        )
      );
      setFeedback({
        type: "success",
        text: "Merci ! Votre retour sur la session a été enregistré.",
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["ALL", "SCHEDULED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const).map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border"
              }`}
            >
              {key === "ALL"
                ? `Toutes (${sessions.length})`
                : SESSION_BADGES[key]?.label ?? key}
            </button>
          )
        )}
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

      {/* Vue calendrier interactive Schedule-X */}
      <section className="bg-card rounded-3xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">
              Calendrier de mes sessions
            </h2>
            <p className="text-xs text-muted-foreground">
              Consultez vos prochaines séances et votre historique à la semaine ou au mois.
            </p>
          </div>
        </div>

        <SessionsScheduleCalendar
          sessions={filtered}
          viewerRole="beneficiary"
        />
      </section>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <Calendar className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune session planifiée
          </h2>
          <p className="text-xs text-muted-foreground">
            Envoyez une demande de mentorat à un mentor ou expert ; dès son
            acceptation, vous pourrez réserver votre prochain créneau de session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => {
            const mentorName = session.mentor
              ? `${session.mentor.prenom} ${session.mentor.nom}`.trim()
              : "Mentor ACCEENT";
            const badge =
              SESSION_BADGES[session.status] ?? SESSION_BADGES.SCHEDULED;
            const safeMeetingUrl = sanitizeExternalUrl(session.meetingUrl);
            const isActionable =
              session.status === "SCHEDULED" ||
              session.status === "RESCHEDULED";

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">
                        {session.titre}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avec {mentorName} ·{" "}
                      {new Date(session.dateDebut).toLocaleString("fr-FR")} –{" "}
                      {new Date(session.dateFin).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-slate-600">
                        Notes : {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {safeMeetingUrl && (
                      <a
                        href={safeMeetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Rejoindre la visio</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {isActionable && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            setRescheduleTargetId((prev) =>
                              prev === session.id ? null : session.id
                            )
                          }
                          className="rounded-full text-xs"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Reprogrammer
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCancel(session.id)}
                          className="rounded-full text-xs"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Annuler
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {rescheduleTargetId === session.id && (
                  <form
                    onSubmit={(e) => handleReschedule(e, session.id)}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-10 gap-2 items-end"
                  >
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-xs">Nouvelle date</Label>
                      <Input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        required
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Début</Label>
                      <Input
                        type="time"
                        value={rescheduleStart}
                        onChange={(e) => setRescheduleStart(e.target.value)}
                        required
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Fin</Label>
                      <Input
                        type="time"
                        value={rescheduleEnd}
                        onChange={(e) => setRescheduleEnd(e.target.value)}
                        required
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending}
                      className="sm:col-span-2 h-9 rounded-xl text-xs"
                    >
                      Valider
                    </Button>
                  </form>
                )}

                {session.status === "COMPLETED" && (
                  <div className="pt-3 border-t border-border/70">
                    {(() => {
                      const savedComment =
                        session.feedbackMentee ?? session.feedback ?? null;
                      return session.rating || savedComment ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                          <span>
                            Évaluation enregistrée :{" "}
                            <strong>{session.rating ?? "-"}/5</strong>
                            {savedComment ? ` · ${savedComment}` : ""}
                          </span>
                        </div>
                      ) : (
                      <form
                        onSubmit={(e) => handleSubmitFeedback(e, session.id)}
                        className="flex flex-col sm:flex-row gap-2 items-end"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs">Note (/5)</Label>
                          <select
                            aria-label="Note de la session"
                            value={ratingMap[session.id] ?? 5}
                            onChange={(e) =>
                              setRatingMap((prev) => ({
                                ...prev,
                                [session.id]: Number(e.target.value),
                              }))
                            }
                            className="h-9 rounded-xl border border-input bg-white px-3 text-xs"
                          >
                            <option value={5}>5 / 5</option>
                            <option value={4}>4 / 5</option>
                            <option value={3}>3 / 5</option>
                            <option value={2}>2 / 5</option>
                            <option value={1}>1 / 5</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full space-y-1">
                          <Label className="text-xs">Votre commentaire</Label>
                          <Input
                            value={feedbackMap[session.id] ?? ""}
                            onChange={(e) =>
                              setFeedbackMap((prev) => ({
                                ...prev,
                                [session.id]: e.target.value,
                              }))
                            }
                            placeholder="Partagez votre retour sur cette séance..."
                            className="h-9 rounded-xl text-xs"
                          />
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isPending}
                          className="rounded-full h-9 text-xs shrink-0"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Envoyer mon avis
                        </Button>
                      </form>
                      );
                    })()}
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
