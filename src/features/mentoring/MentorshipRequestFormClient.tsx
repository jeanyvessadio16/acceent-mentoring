"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { createMentorshipRequestAction } from "@/lib/actions/mentoring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

interface MentorshipRequestFormClientProps {
  mentorId: string;
  mentorName: string;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export function MentorshipRequestFormClient({
  mentorId,
  mentorName,
  onSuccess,
  redirectOnSuccess = true,
}: MentorshipRequestFormClientProps) {
  const router = useRouter();
  const [objectif, setObjectif] = useState("");
  const [problematique, setProblematique] = useState("");
  const [duree, setDuree] = useState("3 mois");
  const [frequence, setFrequence] = useState("2 sessions / mois");
  const [format, setFormat] = useState("INDIVIDUEL");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!objectif.trim() || !problematique.trim() || !message.trim()) {
      setErrorMessage(
        "Merci de renseigner votre objectif, votre problématique et votre message."
      );
      return;
    }

    startTransition(async () => {
      const result = await createMentorshipRequestAction({
        mentorId,
        objectif: objectif.trim(),
        problematique: problematique.trim(),
        duree: duree.trim(),
        frequence: frequence.trim(),
        format,
        message: message.trim(),
      });

      if (!result.ok) {
        setErrorMessage(
          result.error ?? "Impossible d'envoyer votre demande de mentoring."
        );
        return;
      }

      setSuccessMessage(
        `Votre demande de mentoring a bien été envoyée à ${mentorName}.`
      );
      if (onSuccess) {
        onSuccess();
      }
      if (redirectOnSuccess) {
        router.push(ROUTES.BENEFICIARY.PARCOURS);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="req-objectif">Objectif principal *</Label>
        <Input
          id="req-objectif"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          placeholder="Ex : Structurer le modèle économique et lancer la phase pilote"
          required
          className="rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="req-problematique">Problématique / Contexte *</Label>
        <textarea
          id="req-problematique"
          value={problematique}
          onChange={(e) => setProblematique(e.target.value)}
          rows={3}
          required
          placeholder="Décrivez votre stade d'avancement et les défis à résoudre avec le mentor..."
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="req-duree">Durée souhaitée</Label>
          <select
            id="req-duree"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="1 mois">1 mois</option>
            <option value="3 mois">3 mois</option>
            <option value="6 mois">6 mois</option>
            <option value="12 mois">12 mois</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="req-frequence">Fréquence</Label>
          <select
            id="req-frequence"
            value={frequence}
            onChange={(e) => setFrequence(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="1 session / semaine">1 session / semaine</option>
            <option value="2 sessions / mois">2 sessions / mois</option>
            <option value="1 session / mois">1 session / mois</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="req-format">Format</Label>
          <select
            id="req-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="INDIVIDUEL">Individuel</option>
            <option value="COLLECTIF">Collectif</option>
            <option value="HYBRIDE">Hybride</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="req-message">Message de motivation au mentor *</Label>
        <textarea
          id="req-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          required
          placeholder="Expliquez pourquoi vous souhaitez être accompagné par ce mentor..."
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="rounded-full px-6">
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Envoyer la demande de mentoring
        </Button>
      </div>
    </form>
  );
}
