"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  XCircle,
} from "lucide-react";

import {
  cancelSessionAction,
  completeSessionAction,
  createSlotAction,
  deleteSlotAction,
  rescheduleSessionAction,
  updateSlotAction,
  type AvailabilitySlotApiItem,
  type MentorshipSessionApiItem,
} from "@/lib/actions/sessions";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MentorCalendarClientProps {
  initialSlots: AvailabilitySlotApiItem[];
  initialSessions: MentorshipSessionApiItem[];
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

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

function getDayLabel(dayOfWeek: number | null): string {
  const found = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
  return found ? found.label : "Date spécifique";
}

export function MentorCalendarClient({
  initialSlots,
  initialSessions,
}: MentorCalendarClientProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlotApiItem[]>(initialSlots);
  const [sessions, setSessions] =
    useState<MentorshipSessionApiItem[]>(initialSessions);

  // Formulaire de création de créneau
  const [isRecurring, setIsRecurring] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [specificDate, setSpecificDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  // Filtre sessions & actions en ligne
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(
    null
  );
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("10:00");
  const [rescheduleEnd, setRescheduleEnd] = useState("11:00");
  const [rescheduleUrl, setRescheduleUrl] = useState("");
  const [completeNotesMap, setCompleteNotesMap] = useState<
    Record<string, string>
  >({});

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredSessions =
    statusFilter === "ALL"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  function handleCreateSlot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!isRecurring && !specificDate) {
      setFeedback({
        type: "error",
        text: "Veuillez sélectionner une date spécifique pour un créneau ponctuel.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createSlotAction({
        dayOfWeek: isRecurring ? dayOfWeek : undefined,
        specificDate:
          !isRecurring && specificDate
            ? new Date(`${specificDate}T00:00:00`).toISOString()
            : undefined,
        startTime,
        endTime,
        isRecurring,
      });

      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de créer ce créneau.",
        });
        return;
      }

      setSlots((prev) => [...prev, res.data!]);
      setFeedback({
        type: "success",
        text: "Créneau de disponibilité ajouté.",
      });
      router.refresh();
    });
  }

  function handleToggleSlotActive(slot: AvailabilitySlotApiItem) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateSlotAction(slot.id, {
        isActive: !slot.isActive,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de modifier ce créneau.",
        });
        return;
      }
      setSlots((prev) =>
        prev.map((item) =>
          item.id === slot.id ? { ...item, isActive: !item.isActive } : item
        )
      );
      router.refresh();
    });
  }

  function handleDeleteSlot(slotId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteSlotAction(slotId);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer ce créneau.",
        });
        return;
      }
      setSlots((prev) => prev.filter((item) => item.id !== slotId));
      setFeedback({ type: "success", text: "Créneau supprimé." });
      router.refresh();
    });
  }

  function handleCompleteSession(sessionId: string) {
    setFeedback(null);
    const notes = completeNotesMap[sessionId]?.trim() || undefined;
    startTransition(async () => {
      const res = await completeSessionAction(sessionId, notes);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de clôturer cette session.",
        });
        return;
      }
      setSessions((prev) =>
        prev.map((item) =>
          item.id === sessionId
            ? { ...item, status: "COMPLETED", notes: notes ?? item.notes }
            : item
        )
      );
      setFeedback({ type: "success", text: "Session marquée comme terminée." });
      router.refresh();
    });
  }

  function handleCancelSession(sessionId: string) {
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
        prev.map((item) =>
          item.id === sessionId ? { ...item, status: "CANCELLED" } : item
        )
      );
      setFeedback({ type: "success", text: "Session annulée." });
      router.refresh();
    });
  }

  function handleRescheduleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    sessionId: string
  ) {
    e.preventDefault();
    setFeedback(null);

    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      setFeedback({
        type: "error",
        text: "Merci de préciser la nouvelle date et les horaires.",
      });
      return;
    }

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
        meetingUrl: rescheduleUrl.trim() || undefined,
      });

      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de reprogrammer cette session.",
        });
        return;
      }

      setSessions((prev) =>
        prev.map((item) =>
          item.id === sessionId
            ? {
                ...item,
                status: "RESCHEDULED",
                dateDebut: res.data!.dateDebut,
                dateFin: res.data!.dateFin,
                meetingUrl: res.data!.meetingUrl,
              }
            : item
        )
      );
      setRescheduleTargetId(null);
      setRescheduleDate("");
      setRescheduleUrl("");
      setFeedback({ type: "success", text: "Session reprogrammée." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
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

      {/* Section 1 : Gestion des créneaux de disponibilité */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Mes créneaux de disponibilité ({slots.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Définissez vos plages hebdomadaires ou ponctuelles ouvertes à la
                réservation.
              </p>
            </div>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucun créneau configuré pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  slot.isActive
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-slate-50 border-slate-200 opacity-75"
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {slot.isRecurring
                      ? getDayLabel(slot.dayOfWeek)
                      : slot.specificDate
                      ? new Date(slot.specificDate).toLocaleDateString("fr-FR")
                      : "Ponctuel"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      slot.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {slot.isActive ? "Actif" : "En pause"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isPending}
                    onClick={() => handleToggleSlotActive(slot)}
                    className="rounded-full"
                  >
                    {slot.isActive ? "Désactiver" : "Activer"}
                  </Button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDeleteSlot(slot.id)}
                    aria-label="Supprimer ce créneau"
                    className="p-1.5 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleCreateSlot}
          className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-3 space-y-1">
            <Label htmlFor="slot-type" className="text-xs">
              Fréquence
            </Label>
            <select
              id="slot-type"
              value={isRecurring ? "RECURRING" : "ONE_TIME"}
              onChange={(e) => setIsRecurring(e.target.value === "RECURRING")}
              className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs"
            >
              <option value="RECURRING">Hebdomadaire récurrent</option>
              <option value="ONE_TIME">Date spécifique</option>
            </select>
          </div>

          {isRecurring ? (
            <div className="sm:col-span-3 space-y-1">
              <Label htmlFor="slot-day" className="text-xs">
                Jour
              </Label>
              <select
                id="slot-day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="sm:col-span-3 space-y-1">
              <Label htmlFor="slot-date" className="text-xs">
                Date
              </Label>
              <Input
                id="slot-date"
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>
          )}

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="slot-start" className="text-xs">
              Début
            </Label>
            <Input
              id="slot-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="slot-end" className="text-xs">
              Fin
            </Label>
            <Input
              id="slot-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="h-9 rounded-xl text-xs"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="sm:col-span-2 rounded-xl h-9 text-xs"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5 mr-1" />
            )}
            Ajouter
          </Button>
        </form>
      </section>

      {/* Section 2 : Sessions réservées */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Sessions de mentoring ({sessions.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Reprogrammez, clôturez avec compte-rendu ou annulez vos
                rendez-vous.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["ALL", "SCHEDULED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    statusFilter === key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border"
                  }`}
                >
                  {key === "ALL"
                    ? "Toutes"
                    : SESSION_BADGES[key]?.label ?? key}
                </button>
              )
            )}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Aucune session dans cette catégorie.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const menteeName = session.mentee
                ? `${session.mentee.prenom} ${session.mentee.nom}`.trim()
                : "Bénéficiaire";
              const badge =
                SESSION_BADGES[session.status] ?? SESSION_BADGES.SCHEDULED;
              const safeMeetingUrl = sanitizeExternalUrl(session.meetingUrl);
              const isActionable =
                session.status === "SCHEDULED" ||
                session.status === "RESCHEDULED";

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-border/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">
                          {session.titre}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mentoré : {menteeName} ·{" "}
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Visio</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {isActionable && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            disabled={isPending}
                            onClick={() =>
                              setRescheduleTargetId((prev) =>
                                prev === session.id ? null : session.id
                              )
                            }
                            className="rounded-full"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reprogrammer
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            disabled={isPending}
                            onClick={() => handleCancelSession(session.id)}
                            className="rounded-full"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isActionable && (
                    <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2">
                      <Input
                        value={completeNotesMap[session.id] ?? ""}
                        onChange={(e) =>
                          setCompleteNotesMap((prev) => ({
                            ...prev,
                            [session.id]: e.target.value,
                          }))
                        }
                        placeholder="Compte-rendu ou points clés pour clôturer la session..."
                        className="h-8 rounded-xl text-xs flex-1"
                      />
                      <Button
                        type="button"
                        size="xs"
                        disabled={isPending}
                        onClick={() => handleCompleteSession(session.id)}
                        className="rounded-full"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Marquer terminée
                      </Button>
                    </div>
                  )}

                  {rescheduleTargetId === session.id && (
                    <form
                      onSubmit={(e) => handleRescheduleSubmit(e, session.id)}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
                    >
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-[11px]">Nouvelle date</Label>
                        <Input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          required
                          className="h-8 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px]">Début</Label>
                        <Input
                          type="time"
                          value={rescheduleStart}
                          onChange={(e) => setRescheduleStart(e.target.value)}
                          required
                          className="h-8 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px]">Fin</Label>
                        <Input
                          type="time"
                          value={rescheduleEnd}
                          onChange={(e) => setRescheduleEnd(e.target.value)}
                          required
                          className="h-8 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-[11px]">Lien visio (optionnel)</Label>
                        <Input
                          type="url"
                          value={rescheduleUrl}
                          onChange={(e) => setRescheduleUrl(e.target.value)}
                          placeholder="https://meet..."
                          className="h-8 rounded-lg text-xs"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="xs"
                        disabled={isPending}
                        className="sm:col-span-2 h-8 rounded-lg"
                      >
                        Valider
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
