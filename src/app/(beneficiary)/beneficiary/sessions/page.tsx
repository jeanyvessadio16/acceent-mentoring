import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { sessionsApi, MentoringSessionItem } from '@/lib/api/sessions';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, User, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { formatSessionRange, formatDate } from '@/lib/utils/formatters';

function getSessionBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Confirmée</Badge>;
    case 'SCHEDULED':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">Programmée</Badge>;
    case 'RESCHEDULED':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Reportée</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-muted text-muted-foreground text-[10px]">Terminée</Badge>;
    case 'CANCELLED':
      return <Badge variant="destructive" className="text-[10px]">Annulée</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
}

function SessionsSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Mes Rendez-vous">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function BeneficiarySessionsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/sessions');
  }

  let sessionsList: MentoringSessionItem[] = [];
  let userProfile = null;
  let fetchError: string | null = null;

  try {
    const [sessionsRes, userRes] = await Promise.all([
      sessionsApi.getMySessions(session.accessToken),
      usersApi.getMe(session.accessToken).catch(() => null),
    ]);
    sessionsList = sessionsRes;
    userProfile = userRes;
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/sessions');
    }
    fetchError = error?.message || 'Erreur lors du chargement des sessions.';
  }

  const profile = userProfile?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  const upcomingSessions = sessionsList.filter(
    (s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED'
  );
  const pastSessions = sessionsList.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'CANCELLED'
  );

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Mes Rendez-vous">
      <PageHeader
        title="Agenda & Sessions de Mentoring"
        description="Consultez vos séances d'accompagnement programmées et votre historique d’échanges."
      >
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Link href="/beneficiary/mentors" className="flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            Planifier un échange
          </Link>
        </Button>
      </PageHeader>

      {fetchError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{fetchError}</p>
        </div>
      )}

      {sessionsList.length > 0 ? (
        <div className="space-y-8">
          {/* Sessions à venir */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Prochaines séances ({upcomingSessions.length})
            </h2>

            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((item) => {
                const mentor = item.mentorProfile;
                const mentorUser = mentor?.user?.profile;
                const mentorName = mentorUser
                  ? `${mentorUser.firstName} ${mentorUser.lastName}`
                  : 'Votre mentor';

                return (
                  <Card key={item.id} className="shadow-xs border-border hover:border-brand-primary/30 transition-colors">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getSessionBadge(item.status)}
                          <span className="text-xs text-brand-primary font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatSessionRange(item.startTime, item.endTime)}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-primary" />
                          Session avec {mentorName}
                          {mentor?.jobTitle && (
                            <span className="text-xs font-normal text-muted-foreground">
                              • {mentor.jobTitle}
                            </span>
                          )}
                        </h3>

                        {item.journey?.mainObjective && (
                          <p className="text-xs text-muted-foreground">
                            Objectif associé : <span className="font-medium text-foreground">{item.journey.mainObjective}</span>
                          </p>
                        )}

                        {item.summary && (
                          <p className="text-xs text-muted-foreground italic bg-secondary/50 p-2.5 rounded-md">
                            Note : « {item.summary} »
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.meetingUrl && (
                          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                            <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5" />
                              Rejoindre la visio
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground italic p-4 rounded-xl border border-dashed border-border text-center">
                Aucune séance programmée pour le moment.
              </p>
            )}
          </div>

          {/* Sessions passées / Historique */}
          {pastSessions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                Historique des séances passées ({pastSessions.length})
              </h2>

              {pastSessions.map((item) => {
                const mentor = item.mentorProfile;
                const mentorUser = mentor?.user?.profile;
                const mentorName = mentorUser
                  ? `${mentorUser.firstName} ${mentorUser.lastName}`
                  : 'Votre mentor';

                return (
                  <Card key={item.id} className="shadow-xs border-border opacity-90">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSessionBadge(item.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.startTime)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          Échange avec {mentorName}
                        </p>
                        {item.actionPlanNotes && (
                          <p className="text-[11px] text-muted-foreground italic">
                            Compte-rendu : {item.actionPlanNotes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Aucun rendez-vous planifié"
          description="Vous n'avez pas encore de séance programmée dans votre agenda. Réservez votre premier créneau d'échange avec un mentor pour démarrer votre accompagnement."
          actionLabel="Trouver un mentor"
          actionHref="/beneficiary/mentors"
        />
      )}
    </DashboardLayout>
  );
}

export default function BeneficiarySessionsPage() {
  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <BeneficiarySessionsContent />
    </Suspense>
  );
}
