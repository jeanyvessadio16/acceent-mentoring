"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import {
  createMasterclassAction,
  deleteMasterclassAction,
  listMasterclassRegistrationsAction,
  markMasterclassAttendanceAction,
  updateMasterclassAction,
  type MasterclassApiItem,
  type MasterclassRegistrationApiItem,
  type MasterclassStatusValue,
} from "@/lib/actions/catalogs";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MasterclassManagerClientProps {
  initialMasterclasses: MasterclassApiItem[];
}

export function MasterclassManagerClient({
  initialMasterclasses,
}: MasterclassManagerClientProps) {
  const router = useRouter();
  const [masterclasses, setMasterclasses] =
    useState<MasterclassApiItem[]>(initialMasterclasses);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [titre, setTitre] = useState("");
  const [intervenant, setIntervenant] = useState("");
  const [categorie, setCategorie] = useState("");
  const [dateSession, setDateSession] = useState("");
  const [duree, setDuree] = useState("60");
  const [lienLive, setLienLive] = useState("");
  const [lienReplay, setLienReplay] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [description, setDescription] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [registrationsMap, setRegistrationsMap] = useState<
    Record<string, MasterclassRegistrationApiItem[]>
  >({});

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    if (
      !titre.trim() ||
      !intervenant.trim() ||
      !categorie.trim() ||
      !dateSession ||
      !description.trim()
    ) {
      setFeedback({
        type: "error",
        text: "Merci de remplir tous les champs obligatoires.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createMasterclassAction({
        titre: titre.trim(),
        intervenant: intervenant.trim(),
        categorie: categorie.trim(),
        description: description.trim(),
        dateSession: new Date(dateSession).toISOString(),
        duree: Math.max(15, Number(duree) || 60),
        lienLive: lienLive.trim() || undefined,
        lienReplay: lienReplay.trim() || undefined,
        maxParticipants: maxParticipants
          ? Math.max(1, Number(maxParticipants))
          : undefined,
      });

      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de planifier cette masterclass.",
        });
        return;
      }

      setMasterclasses((prev) => [res.data!, ...prev]);
      setTitre("");
      setIntervenant("");
      setCategorie("");
      setDateSession("");
      setDuree("60");
      setLienLive("");
      setLienReplay("");
      setMaxParticipants("");
      setDescription("");
      setShowCreateForm(false);
      setFeedback({ type: "success", text: "Masterclass planifiée !" });
      router.refresh();
    });
  }

  function handleStatusChange(id: string, statut: MasterclassStatusValue) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateMasterclassAction(id, { statut });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de modifier le statut.",
        });
        return;
      }
      setMasterclasses((prev) =>
        prev.map((m) => (m.id === id ? { ...m, statut } : m))
      );
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteMasterclassAction(id);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer la masterclass.",
        });
        return;
      }
      setMasterclasses((prev) => prev.filter((m) => m.id !== id));
      setFeedback({ type: "success", text: "Masterclass supprimée." });
      router.refresh();
    });
  }

  function handleToggleRegistrations(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    startTransition(async () => {
      const res = await listMasterclassRegistrationsAction(id);
      if (res.ok) {
        setRegistrationsMap((prev) => ({ ...prev, [id]: res.data }));
      }
    });
  }

  function handleToggleAttendance(
    masterclassId: string,
    userId: string,
    currentAttended: boolean
  ) {
    startTransition(async () => {
      const res = await markMasterclassAttendanceAction(
        masterclassId,
        userId,
        !currentAttended
      );
      if (!res.ok) return;
      setRegistrationsMap((prev) => ({
        ...prev,
        [masterclassId]: (prev[masterclassId] ?? []).map((reg) =>
          reg.userId === userId ? { ...reg, attended: !currentAttended } : reg
        ),
      }));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="rounded-full px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {showCreateForm ? "Fermer le formulaire" : "Planifier une session"}
        </Button>
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

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4"
        >
          <h2 className="text-base font-bold text-foreground">
            Planifier une masterclass
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mc-title">Titre *</Label>
              <Input
                id="mc-title"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-speaker">Intervenant *</Label>
              <Input
                id="mc-speaker"
                value={intervenant}
                onChange={(e) => setIntervenant(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-cat">Catégorie *</Label>
              <Input
                id="mc-cat"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                placeholder="Ex : Finance, Leadership, AgriTech"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-date">Date &amp; heure *</Label>
              <Input
                id="mc-date"
                type="datetime-local"
                value={dateSession}
                onChange={(e) => setDateSession(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-duration">Durée (minutes) *</Label>
              <Input
                id="mc-duration"
                type="number"
                min={15}
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-max">Participants max (optionnel)</Label>
              <Input
                id="mc-max"
                type="number"
                min={1}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-live">Lien Live</Label>
              <Input
                id="mc-live"
                type="url"
                value={lienLive}
                onChange={(e) => setLienLive(e.target.value)}
                placeholder="https://meet..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-replay">Lien Replay</Label>
              <Input
                id="mc-replay"
                type="url"
                value={lienReplay}
                onChange={(e) => setLienReplay(e.target.value)}
                placeholder="https://youtube..."
                className="rounded-xl"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="mc-desc">Description *</Label>
              <textarea
                id="mc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="rounded-full"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      )}

      {masterclasses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <GraduationCap className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune masterclass planifiée
          </h2>
          <p className="text-xs text-muted-foreground">
            Utilisez le bouton &quot;Planifier une session&quot; pour programmer
            une nouvelle masterclass.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {masterclasses.map((mc) => {
            const safeLive = sanitizeExternalUrl(mc.lienLive);
            const safeReplay = sanitizeExternalUrl(mc.lienReplay);
            const regs = registrationsMap[mc.id];
            const isExpanded = expandedId === mc.id;

            return (
              <div
                key={mc.id}
                className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {mc.titre}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {mc.categorie}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      <span>{mc.intervenant}</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(mc.dateSession).toLocaleString("fr-FR")} (
                        {mc.duree} min)
                      </span>
                      {mc._count?.registrations !== undefined && (
                        <span>
                          · {mc._count.registrations} inscrit
                          {mc._count.registrations > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {safeLive && (
                      <a
                        href={safeLive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary"
                      >
                        <span>Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {safeReplay && (
                      <a
                        href={safeReplay}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary"
                      >
                        <span>Replay</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleToggleRegistrations(mc.id)}
                      className="rounded-full"
                    >
                      <Users className="h-3.5 w-3.5 mr-1" />
                      Inscrits
                    </Button>
                    <select
                      aria-label="Statut masterclass"
                      value={mc.statut}
                      disabled={isPending}
                      onChange={(e) =>
                        handleStatusChange(
                          mc.id,
                          e.target.value as MasterclassStatusValue
                        )
                      }
                      className="h-8 rounded-full border border-input bg-white px-3 text-xs font-semibold"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(mc.id)}
                      aria-label="Supprimer la masterclass"
                      className="p-2 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-border/70 space-y-2">
                    <h4 className="text-xs font-bold text-foreground">
                      Liste des participants inscrits
                    </h4>
                    {!regs ? (
                      <p className="text-xs text-muted-foreground">
                        Chargement...
                      </p>
                    ) : regs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Aucun inscrit pour le moment.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/60">
                        {regs.map((reg) => (
                          <li
                            key={reg.id}
                            className="py-2 flex items-center justify-between gap-2 text-xs"
                          >
                            <span>
                              {reg.user
                                ? `${reg.user.prenom} ${reg.user.nom} (${reg.user.email})`
                                : reg.userId}
                            </span>
                            <Button
                              type="button"
                              variant={reg.attended ? "default" : "outline"}
                              size="xs"
                              disabled={isPending}
                              onClick={() =>
                                handleToggleAttendance(
                                  mc.id,
                                  reg.userId,
                                  reg.attended
                                )
                              }
                              className="rounded-full"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {reg.attended ? "Présent" : "Marquer présent"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
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
