import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { sessionsApi, MentoringSessionItem } from '@/lib/api/sessions';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus, Clock, Video, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatSessionRange, formatDate } from '@/lib/utils/formatters';

function getSessionStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">Confirmée</Badge>;
    case 'SCHEDULED':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">Programmée</Badge>;
    case 'RESCHEDULED':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Reportée</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-muted text-muted-foreground text-[10px]">Clôturée</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
}

function MentorSessionsSkeleton() {
  return (
    <DashboardLayout role="MENTOR" userName="Chargement..." pageTitle="Mon Agenda">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function MentorSessionsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/mentor/sessions');
  }

  // Vérification de rôle
  if (session.role !== 'MENTOR' && session.role !== 'EXPERT' && session.role !== 'ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userRes, sessionsRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    sessionsApi.getMySessions(session.accessToken).catch(() => []),
  ]);

  const profile = userRes?.profile;
  const mentorFullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Mentor ACCEENT';

  const rawSessions = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes as any)?.items || [];
  const sessionsList: MentoringSessionItem[] = rawSessions;

  const upcomingSessions = sessionsList.filter(
    (s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED'
  );
  const completedSessions = sessionsList.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'CANCELLED'
  );

  return (
    <DashboardLayout role="MENTOR" userName={mentorFullName} pageTitle="Mon Agenda">
      <PageHeader
        title="Agenda & Séances de mentorat"
        description="Consultez vos rendez-vous de mentoring programmés et accédez aux liens de visioconférence."
      >
        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link href="/mentor/journey">Mes mentorés</Link>
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Séances à venir */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-primary" />
            Séances programmées ({upcomingSessions.length})
          </h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((sessionItem) => {
                const benProfile = sessionItem.journey?.beneficiary?.profile;
                const benName = benProfile?.firstName
                  ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
                  : 'Bénéficiaire';

                return (
                  <Card
                    key={sessionItem.id}
                    className="shadow-xs border-border hover:border-brand-primary/30 transition-colors"
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {getSessionStatusBadge(sessionItem.status)}
                          <span className="text-xs text-brand-primary font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatSessionRange(sessionItem.startTime, sessionItem.endTime)}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-primary" />
                          Accompagnement de {benName}
                        </h3>

                        {sessionItem.journey?.mainObjective && (
                          <p className="text-xs text-muted-foreground">
                            Objectif : {sessionItem.journey.mainObjective}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sessionItem.meetingUrl ? (
                          <Button
                            asChild
                            size="sm"
                            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
                          >
                            <a
                              href={sessionItem.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Rejoindre la visio
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Lien visio en attente
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Aucune séance programmée"
              description="Dès qu'un rendez-vous est convenu avec l'un de vos mentorés, il s'affichera directement ici avec son lien de visioconférence."
              icon={Calendar}
            />
          )}
        </div>

        {/* Historique des séances terminées */}
        {completedSessions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/60">
            <h2 className="text-sm font-bold text-foreground">
              Historique des séances clôturées ({completedSessions.length})
            </h2>
            <div className="space-y-2">
              {completedSessions.map((s) => {
                const benProfile = s.journey?.beneficiary?.profile;
                const benName = benProfile?.firstName
                  ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
                  : 'Bénéficiaire';

                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">Séance avec {benName}</span>
                      <p className="text-muted-foreground">{formatDate(s.startTime)}</p>
                    </div>
                    {getSessionStatusBadge(s.status)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function MentorSessionsPage() {
  return (
    <Suspense fallback={<MentorSessionsSkeleton />}>
      <MentorSessionsContent />
    </Suspense>
  );
}
