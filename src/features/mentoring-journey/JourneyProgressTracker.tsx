'use client';

import React from 'react';
import { MentoringJourneyItem, JourneyObjectiveItem } from '@/lib/api/journeys';
import { toggleActionStatusAction } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  CheckSquare,
  Square,
  Users,
  Target,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface JourneyProgressTrackerProps {
  journey: MentoringJourneyItem;
}

export function JourneyProgressTracker({ journey }: JourneyProgressTrackerProps) {
  const [objectives, setObjectives] = React.useState<JourneyObjectiveItem[]>(journey.objectives || []);

  const totalTasks = objectives.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0);
  const doneTasks = objectives.reduce(
    (acc, obj) => acc + (obj.actions?.filter((a) => a.status === 'DONE').length || 0),
    0
  );
  const calculatedPercent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : journey.progressPercentage || 0;

  const handleToggleTask = async (objectiveId: string, actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';

    // Optimistic UI update
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectiveId) return obj;
        return {
          ...obj,
          actions: obj.actions.map((act) =>
            act.id === actionId ? { ...act, status: newStatus } : act
          ),
        };
      })
    );

    await toggleActionStatusAction(journey.id, actionId, newStatus);
  };

  const mentor = journey.mentorProfile;
  const mentorName = mentor?.user?.profile
    ? `${mentor.user.profile.firstName} ${mentor.user.profile.lastName}`
    : 'Votre Mentor';

  return (
    <div className="space-y-6">
      {/* Header avec jauge de progression et détails du mentor */}
      <Card className="shadow-xs border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <Badge className="bg-brand-primary text-white text-[10px]">
                  {journey.status === 'ACTIVE' ? 'Parcours Actif' : journey.status}
                </Badge>
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                {journey.mainObjective || 'Parcours d’Accompagnement Mentoring'}
              </CardTitle>
              {mentor && (
                <CardDescription className="text-xs flex items-center gap-1.5 pt-0.5">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  Mentor référent : <span className="font-semibold text-foreground">{mentorName}</span>
                  {mentor.jobTitle && <span>({mentor.jobTitle})</span>}
                </CardDescription>
              )}
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-3xl font-extrabold text-brand-primary">{calculatedPercent}%</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Progression globale
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${calculatedPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
            <span>
              {doneTasks} sur {totalTasks} actions réalisées
            </span>
            <span>{objectives.length} objectifs de feuille de route</span>
          </div>
        </CardContent>
      </Card>

      {/* Liste des objectifs et actions de la feuille de route */}
      <div className="space-y-4">
        {objectives.map((objective, idx) => {
          const objActions = objective.actions || [];
          const allDone = objActions.length > 0 && objActions.every((a) => a.status === 'DONE');

          return (
            <Card key={objective.id} className="shadow-xs overflow-hidden border-border">
              <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      allDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-brand-primary/10 text-brand-primary'
                    }`}
                  >
                    {allDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{objective.title}</h4>
                    {objective.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{objective.description}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                    allDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {allDone ? 'Complété' : 'En cours'}
                </span>
              </div>

              <CardContent className="p-4 space-y-2">
                {objActions.length > 0 ? (
                  objActions.map((task) => {
                    const isDone = task.status === 'DONE';

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(objective.id, task.id, task.status)}
                        className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-muted/50 border-transparent text-muted-foreground'
                            : 'bg-card border-border hover:border-brand-primary/40 hover:bg-secondary/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            aria-label={isDone ? 'Marquer comme non fait' : 'Marquer comme fait'}
                            className="mt-0.5"
                          >
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`text-xs font-medium block leading-snug ${
                                isDone ? 'line-through' : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </div>

                        {task.dueDate && (
                          <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic py-1">
                    Aucune action définie pour cet objectif.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ressources pédagogiques associées */}
      {journey.resources && journey.resources.length > 0 && (
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              Documents & Ressources du parcours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {journey.resources.map((res) => (
              <div
                key={res.id}
                className="p-3 rounded-lg border border-border flex items-center justify-between hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{res.title}</p>
                    <span className="text-[10px] text-muted-foreground uppercase">{res.type}</span>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost" className="text-xs h-8">
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    Consulter
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
