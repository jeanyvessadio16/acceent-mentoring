"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Compass,
  ExternalLink,
  Link2,
  Loader2,
  MessageSquare,
  Plus,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  cancelMentorshipRequestAction,
  createProgramGoalAction,
  createProgramResourceAction,
  createProgramTaskAction,
  deleteProgramGoalAction,
  deleteProgramResourceAction,
  deleteProgramTaskAction,
  getMentorshipProgramDetailAction,
  updateMentorshipProgramAction,
  updateProgramGoalAction,
  updateProgramTaskAction,
  type MentorshipProgramApiItem,
  type MentorshipProgramDetailApiItem,
  type MentorshipRequestApiItem,
} from "@/lib/actions/mentoring";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProgramWorkspaceClientProps {
  role: "mentor" | "mentee";
  initialPrograms: MentorshipProgramApiItem[];
  initialDetail: MentorshipProgramDetailApiItem | null;
  sentRequests?: MentorshipRequestApiItem[];
}

const REQUEST_STATUS_MAP: Record<string, { label: string; badge: string }> = {
  PENDING: {
    label: "En attente",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ACCEPTED: {
    label: "Acceptée",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Refusée",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Annulée",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  COMPLETED: {
    label: "Terminée",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function ProgramWorkspaceClient({
  role,
  initialPrograms,
  initialDetail,
  sentRequests = [],
}: ProgramWorkspaceClientProps) {
  const router = useRouter();
  const [programs, setPrograms] =
    useState<MentorshipProgramApiItem[]>(initialPrograms);
  const [selectedDetail, setSelectedDetail] =
    useState<MentorshipProgramDetailApiItem | null>(initialDetail);
  const [requests, setRequests] =
    useState<MentorshipRequestApiItem[]>(sentRequests);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalIndicators, setGoalIndicators] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskGoalId, setTaskGoalId] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState<
    "DOCUMENT" | "LINK" | "VIDEO"
  >("LINK");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshCurrentDetail(programId: string) {
    startTransition(async () => {
      const detailRes = await getMentorshipProgramDetailAction(programId);
      if (detailRes.ok && detailRes.data) {
        setSelectedDetail(detailRes.data);
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  status: detailRes.data!.status,
                  progression: detailRes.data!.progression,
                }
              : p
          )
        );
      }
      router.refresh();
    });
  }

  function handleSelectProgram(programId: string) {
    setFeedback(null);
    startTransition(async () => {
      const detailRes = await getMentorshipProgramDetailAction(programId);
      if (detailRes.ok && detailRes.data) {
        setSelectedDetail(detailRes.data);
      } else {
        setFeedback({
          type: "error",
          text: detailRes.error ?? "Impossible de charger ce parcours.",
        });
      }
    });
  }

  function handleCancelRequest(requestId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelMentorshipRequestAction(requestId);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible d'annuler cette demande.",
        });
        return;
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "CANCELLED" } : r
        )
      );
      setFeedback({ type: "success", text: "Demande annulée." });
    });
  }

  function handleAddGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDetail || !goalTitle.trim()) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await createProgramGoalAction(selectedDetail.id, {
        titre: goalTitle.trim(),
        indicateurs: goalIndicators.trim() || undefined,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Erreur lors de l'ajout de l'objectif.",
        });
        return;
      }
      setGoalTitle("");
      setGoalIndicators("");
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleToggleGoal(goalId: string, current: boolean) {
    if (!selectedDetail) return;
    startTransition(async () => {
      const res = await updateProgramGoalAction(selectedDetail.id, goalId, {
        isCompleted: !current,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de modifier cet objectif.",
        });
        return;
      }
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleDeleteGoal(goalId: string) {
    if (!selectedDetail) return;
    startTransition(async () => {
      const res = await deleteProgramGoalAction(selectedDetail.id, goalId);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer cet objectif.",
        });
        return;
      }
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDetail || !taskTitle.trim()) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await createProgramTaskAction(selectedDetail.id, {
        titre: taskTitle.trim(),
        goalId: taskGoalId || undefined,
        echeance: taskDue ? new Date(taskDue).toISOString() : undefined,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Erreur lors de l'ajout de la tâche.",
        });
        return;
      }
      setTaskTitle("");
      setTaskGoalId("");
      setTaskDue("");
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleCycleTaskStatus(taskId: string, currentStatus: string) {
    if (!selectedDetail) return;
    const nextStatus =
      currentStatus === "PENDING"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
        ? "COMPLETED"
        : "PENDING";

    startTransition(async () => {
      const res = await updateProgramTaskAction(selectedDetail.id, taskId, {
        status: nextStatus,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de mettre à jour la tâche.",
        });
        return;
      }
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleDeleteTask(taskId: string) {
    if (!selectedDetail) return;
    startTransition(async () => {
      const res = await deleteProgramTaskAction(selectedDetail.id, taskId);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer cette tâche.",
        });
        return;
      }
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleAddResource(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDetail || !resourceTitle.trim() || !resourceUrl.trim()) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await createProgramResourceAction(selectedDetail.id, {
        titre: resourceTitle.trim(),
        type: resourceType,
        url: resourceUrl.trim(),
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible d'ajouter cette ressource.",
        });
        return;
      }
      setResourceTitle("");
      setResourceUrl("");
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleDeleteResource(resourceId: string) {
    if (!selectedDetail) return;
    startTransition(async () => {
      const res = await deleteProgramResourceAction(
        selectedDetail.id,
        resourceId
      );
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer cette ressource.",
        });
        return;
      }
      refreshCurrentDetail(selectedDetail.id);
    });
  }

  function handleProgramStatusChange(
    newStatus: "ACTIVE" | "COMPLETED" | "PAUSED"
  ) {
    if (!selectedDetail) return;
    startTransition(async () => {
      const res = await updateMentorshipProgramAction(selectedDetail.id, {
        status: newStatus,
      });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de modifier le statut du parcours.",
        });
        return;
      }
      setFeedback({ type: "success", text: "Statut du parcours mis à jour." });
      refreshCurrentDetail(selectedDetail.id);
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

      {role === "mentee" && requests.length > 0 && (
        <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">
              Mes demandes de mentoring envoyées
            </h2>
            <span className="text-xs text-muted-foreground">
              {requests.length} demande{requests.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-border/70">
            {requests.map((req) => {
              const mentorName = req.mentor
                ? `${req.mentor.prenom} ${req.mentor.nom}`.trim()
                : "Mentor";
              const st = REQUEST_STATUS_MAP[req.status] ?? REQUEST_STATUS_MAP.PENDING;
              return (
                <div
                  key={req.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {mentorName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.badge}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {req.objectif}
                    </p>
                    {req.responseMessage && (
                      <p className="text-xs text-primary">
                        Réponse : {req.responseMessage}
                      </p>
                    )}
                  </div>
                  {req.status === "PENDING" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isPending}
                      onClick={() => handleCancelRequest(req.id)}
                      className="rounded-full self-start sm:self-auto"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Annuler
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {programs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-3">
          <Compass className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            Aucun parcours d&apos;accompagnement actif
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {role === "mentee"
              ? "Adressez une demande à un mentor disponible pour démarrer votre parcours."
              : "Acceptez une demande de mentoring pour initier un parcours structuré avec votre mentoré."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground px-1">
              Parcours ({programs.length})
            </h2>
            {programs.map((program) => {
              const partner =
                role === "mentee" ? program.mentor : program.mentee;
              const partnerName = partner
                ? `${partner.prenom} ${partner.nom}`.trim()
                : "Participant";
              const isActive = selectedDetail?.id === program.id;

              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => handleSelectProgram(program.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                    isActive
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "bg-white border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2">
                      {program.titre}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary shrink-0">
                      {program.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role === "mentee" ? "Mentor" : "Bénéficiaire"} :{" "}
                    {partnerName}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>Progression</span>
                      <span>{Math.round(program.progression)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, program.progression))}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="lg:col-span-8 space-y-6">
            {selectedDetail ? (
              <>
                <div className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedDetail.titre}
                      </h2>
                      {selectedDetail.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedDetail.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Démarré le{" "}
                        {new Date(selectedDetail.startDate).toLocaleDateString(
                          "fr-FR"
                        )}{" "}
                        · Progression globale :{" "}
                        <span className="font-bold text-primary">
                          {Math.round(selectedDetail.progression)}%
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        href={
                          role === "mentee"
                            ? `/beneficiary/messages?recipientId=${selectedDetail.mentorId}`
                            : `/mentor/messages?recipientId=${selectedDetail.menteeId}`
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Messagerie</span>
                      </Link>
                      {role === "mentor" && (
                        <select
                          aria-label="Statut du parcours"
                          value={selectedDetail.status}
                          disabled={isPending}
                          onChange={(e) =>
                            handleProgramStatusChange(
                              e.target.value as "ACTIVE" | "COMPLETED" | "PAUSED"
                            )
                          }
                          className="h-8 rounded-full border border-border bg-white px-3 text-xs font-semibold"
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="PAUSED">En pause</option>
                          <option value="COMPLETED">Terminé</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objectifs SMART (F08) */}
                <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      Objectifs du parcours ({selectedDetail.goals.length})
                    </h3>
                  </div>

                  {selectedDetail.goals.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucun objectif défini pour le moment.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {selectedDetail.goals.map((goal) => (
                        <li
                          key={goal.id}
                          className="p-3.5 rounded-2xl border border-border/70 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            {role === "mentor" ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  handleToggleGoal(goal.id, goal.isCompleted)
                                }
                                aria-label="Basculer statut objectif"
                                className="mt-0.5 text-primary"
                              >
                                {goal.isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            ) : goal.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  goal.isCompleted
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {goal.titre}
                              </p>
                              {goal.indicateurs && (
                                <p className="text-xs text-muted-foreground">
                                  Indicateur : {goal.indicateurs}
                                </p>
                              )}
                            </div>
                          </div>

                          {role === "mentor" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleDeleteGoal(goal.id)}
                              aria-label="Supprimer objectif"
                              className="p-1 text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {role === "mentor" && (
                    <form
                      onSubmit={handleAddGoal}
                      className="pt-3 border-t border-border/70 grid grid-cols-1 sm:grid-cols-12 gap-2"
                    >
                      <Input
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="Nouvel objectif SMART..."
                        className="sm:col-span-6 h-9 rounded-xl text-xs"
                        required
                      />
                      <Input
                        value={goalIndicators}
                        onChange={(e) => setGoalIndicators(e.target.value)}
                        placeholder="Indicateur de succès"
                        className="sm:col-span-4 h-9 rounded-xl text-xs"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                        className="sm:col-span-2 rounded-xl h-9 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Ajouter
                      </Button>
                    </form>
                  )}
                </section>

                {/* Tâches et actions (F08) */}
                <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-bold text-foreground">
                        Plan d&apos;action &amp; Tâches ({selectedDetail.tasks.length})
                      </h3>
                    </div>
                  </div>

                  {selectedDetail.tasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucune tâche enregistrée pour ce parcours.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedDetail.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="p-3 rounded-2xl border border-border/70 flex items-center justify-between gap-3"
                        >
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleCycleTaskStatus(task.id, task.status)
                            }
                            className="flex items-center gap-2.5 text-left flex-1"
                          >
                            {task.status === "COMPLETED" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : task.status === "IN_PROGRESS" ? (
                              <Loader2 className="h-4 w-4 text-amber-600 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  task.status === "COMPLETED"
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {task.titre}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Statut : {task.status}
                                {task.goalId
                                  ? ` · Objectif : ${
                                      selectedDetail.goals.find(
                                        (g) => g.id === task.goalId
                                      )?.titre ?? "Lié"
                                    }`
                                  : ""}
                                {task.echeance
                                  ? ` · Échéance : ${new Date(
                                      task.echeance
                                    ).toLocaleDateString("fr-FR")}`
                                  : ""}
                              </p>
                            </div>
                          </button>
                          {role === "mentor" && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleDeleteTask(task.id)}
                              aria-label="Supprimer tâche"
                              className="p-1 text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {role === "mentor" && (
                    <form
                      onSubmit={handleAddTask}
                      className="pt-3 border-t border-border/70 grid grid-cols-1 sm:grid-cols-12 gap-2"
                    >
                      <Input
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Ajouter une action à réaliser..."
                        className="sm:col-span-4 h-9 rounded-xl text-xs"
                        required
                      />
                      <select
                        value={taskGoalId}
                        onChange={(e) => setTaskGoalId(e.target.value)}
                        aria-label="Rattacher à un objectif"
                        className="sm:col-span-3 h-9 rounded-xl border border-input bg-white px-2 text-xs"
                      >
                        <option value="">Sans sous-objectif</option>
                        {selectedDetail.goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.titre}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="date"
                        value={taskDue}
                        onChange={(e) => setTaskDue(e.target.value)}
                        aria-label="Date d'échéance"
                        className="sm:col-span-3 h-9 rounded-xl text-xs"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                        className="sm:col-span-2 rounded-xl h-9 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Ajouter
                      </Button>
                    </form>
                  )}
                </section>

                {/* Ressources partagées (F08) */}
                <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      Ressources partagées ({selectedDetail.resources.length})
                    </h3>
                  </div>

                  {selectedDetail.resources.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucune ressource partagée dans ce parcours.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedDetail.resources.map((res) => {
                        const safeUrl = sanitizeExternalUrl(res.url);
                        return (
                          <li
                            key={res.id}
                            className="p-3 rounded-2xl border border-border/70 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Link2 className="h-4 w-4 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {res.titre}
                                </p>
                                <span className="text-[11px] text-muted-foreground">
                                  {res.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {safeUrl && (
                                <a
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15"
                                >
                                  <span>Ouvrir</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {role === "mentor" && (
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => handleDeleteResource(res.id)}
                                  aria-label="Supprimer ressource"
                                  className="p-1 text-muted-foreground hover:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {role === "mentor" && (
                    <form
                      onSubmit={handleAddResource}
                      className="pt-3 border-t border-border/70 grid grid-cols-1 sm:grid-cols-12 gap-2"
                    >
                      <div className="sm:col-span-4 space-y-1">
                        <Label htmlFor="res-title" className="sr-only">
                          Titre ressource
                        </Label>
                        <Input
                          id="res-title"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          placeholder="Titre de la ressource"
                          className="h-9 rounded-xl text-xs"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <select
                          value={resourceType}
                          onChange={(e) =>
                            setResourceType(
                              e.target.value as
                                | "DOCUMENT"
                                | "LINK"
                                | "VIDEO"
                            )
                          }
                          aria-label="Type de ressource"
                          className="h-9 w-full rounded-xl border border-input bg-white px-2 text-xs"
                        >
                          <option value="LINK">Lien</option>
                          <option value="DOCUMENT">Document</option>
                          <option value="VIDEO">Vidéo</option>
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <Input
                          type="url"
                          value={resourceUrl}
                          onChange={(e) => setResourceUrl(e.target.value)}
                          placeholder="https://..."
                          className="h-9 rounded-xl text-xs"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                        className="sm:col-span-2 rounded-xl h-9 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Partager
                      </Button>
                    </form>
                  )}
                </section>

                {/* Sessions liées au parcours (F08 / F09) */}
                <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <h3 className="text-base font-bold text-foreground">
                        Sessions du parcours ({selectedDetail.sessions.length})
                      </h3>
                    </div>
                    <Link
                      href={
                        role === "mentee"
                          ? "/beneficiary/sessions"
                          : "/mentor/calendar"
                      }
                      className="text-xs font-semibold text-secondary hover:underline"
                    >
                      Gérer mes sessions
                    </Link>
                  </div>

                  {selectedDetail.sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucune session enregistrée pour ce parcours pour le moment.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedDetail.sessions.map((sess) => {
                        const safeMeeting = sanitizeExternalUrl(sess.meetingUrl);
                        return (
                          <li
                            key={sess.id}
                            className="p-3 rounded-2xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-foreground">
                                {sess.titre}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(sess.dateDebut).toLocaleString("fr-FR")} · Statut :{" "}
                                <span className="font-semibold">{sess.status}</span>
                              </p>
                            </div>
                            {safeMeeting && (
                              <a
                                href={safeMeeting}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary hover:bg-secondary/15 self-start sm:self-auto"
                              >
                                <span>Lien visio</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
                Sélectionnez un parcours à gauche pour afficher ses objectifs et
                tâches.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
