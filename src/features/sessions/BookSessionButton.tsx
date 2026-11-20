"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, CheckCircle2, Clock, Loader2, X } from "lucide-react";

import {
  bookSessionAction,
  getMentorSlotsAction,
  type AvailabilitySlotApiItem,
} from "@/lib/actions/sessions";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookSessionButtonProps {
  mentorId: string;
  mentorName: string;
  isAvailable?: boolean;
}

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function BookSessionButton({
  mentorId,
  mentorName,
  isAvailable = true,
}: BookSessionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlotApiItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [titre, setTitre] = useState(`Session de mentoring avec ${mentorName}`);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenModal() {
    setOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingSlots(true);
    getMentorSlotsAction(mentorId)
      .then((res) => {
        if (res.ok) {
          setSlots(res.data);
        }
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
    const chosen = slots.find((s) => s.id === slotId);
    if (!chosen) return;
    setStartTime(chosen.startTime);
    setEndTime(chosen.endTime);
    if (chosen.specificDate) {
      setDate(chosen.specificDate.slice(0, 10));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!titre.trim() || !date || !startTime || !endTime) {
      setErrorMessage(
        "Merci de renseigner le titre, la date et l'horaire souhaités."
      );
      return;
    }

    const startIso = new Date(`${date}T${startTime}:00`);
    const endIso = new Date(`${date}T${endTime}:00`);
    if (
      Number.isNaN(startIso.getTime()) ||
      Number.isNaN(endIso.getTime()) ||
      endIso <= startIso
    ) {
      setErrorMessage(
        "L'heure de fin doit être strictement postérieure à l'heure de début."
      );
      return;
    }

    startTransition(async () => {
      const result = await bookSessionAction({
        mentorId,
        slotId: selectedSlotId || undefined,
        titre: titre.trim(),
        dateDebut: startIso.toISOString(),
        dateFin: endIso.toISOString(),
        meetingUrl: meetingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.ok) {
        setErrorMessage(
          result.error ?? "Impossible de réserver cette session."
        );
        return;
      }

      setSuccessMessage("Votre session a bien été réservée !");
      setOpen(false);
      router.push(ROUTES.BENEFICIARY.SESSIONS);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenModal}
        disabled={!isAvailable}
        className="rounded-full px-5"
      >
        <CalendarPlus className="h-4 w-4 mr-2" />
        Réserver une session
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-session-title"
        >
          <div className="bg-white rounded-3xl border border-border shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2
                  id="book-session-title"
                  className="text-lg font-bold text-foreground"
                >
                  Réserver une session avec {mentorName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choisissez un créneau de disponibilité ou proposez une plage
                  horaire.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-1.5 rounded-full text-muted-foreground hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des disponibilités du mentor...</span>
              </div>
            ) : slots.length > 0 ? (
              <div className="space-y-1.5">
                <Label htmlFor="slot-picker" className="text-xs font-semibold">
                  Créneaux configurés par le mentor
                </Label>
                <select
                  id="slot-picker"
                  value={selectedSlotId}
                  onChange={(e) => handleSelectSlot(e.target.value)}
                  className="h-9 w-full rounded-xl border border-input bg-white px-3 text-xs"
                >
                  <option value="">-- Sélection libre ou choisir un créneau --</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.isRecurring && slot.dayOfWeek !== null
                        ? `${DAY_NAMES[slot.dayOfWeek] ?? "Jour"} : `
                        : slot.specificDate
                        ? `${new Date(slot.specificDate).toLocaleDateString(
                            "fr-FR"
                          )} : `
                        : ""}
                      {slot.startTime} – {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  Ce mentor n&apos;a pas encore listé de créneaux fixes : proposez
                  directement une date et un horaire ci-dessous.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="book-title">Titre de la session *</Label>
                <Input
                  id="book-title"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="book-date">Date *</Label>
                  <Input
                    id="book-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="book-start">Début *</Label>
                  <Input
                    id="book-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="book-end">Fin *</Label>
                  <Input
                    id="book-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-url">Lien visioconférence (optionnel)</Label>
                <Input
                  id="book-url"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-notes">Ordre du jour / Notes</Label>
                <textarea
                  id="book-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Sujets à aborder pendant cette session..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-medium text-red-600">{errorMessage}</p>
              )}

              {successMessage && (
                <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{successMessage}</span>
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-full"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isPending} className="rounded-full">
                  {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Confirmer la réservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
