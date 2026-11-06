import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { journeysApi, MentoringJourneyItem } from '@/lib/api/journeys';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, ArrowRight, UserCheck, Calendar, Users, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

function MentorJourneySkeleton() {
  return (
    <DashboardLayout role="MENTOR" userName="Chargement..." pageTitle="Suivi des mentorés">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function MentorJourneyContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/mentor/journey');
  }

  // Vérification de rôle
  if (session.role !== 'MENTOR' && session.role !== 'EXPERT' && session.role !== 'ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userRes, journeysRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    journeysApi.getMyJourneys(session.accessToken).catch(() => []),
  ]);

  const profile = userRes?.profile;
  const mentorFullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Mentor ACCEENT';

  const rawList = Array.isArray(journeysRes) ? journeysRes : (journeysRes as any)?.items || [];
  const journeysList: MentoringJourneyItem[] = rawList;

  return (
    <DashboardLayout role="MENTOR" userName={mentorFullName} pageTitle="Suivi des mentorés">
      <PageHeader
        title="Mentorés accompagnés & Feuilles de route"
        description="Consultez l'avancement des objectifs, les jalons validés et les prochaines étapes de vos mentorés."
      >
        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link href="/mentor/requests">Demandes d'accompagnement</Link>
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {journeysList.length > 0 ? (
          journeysList.map((journey) => {
            const benProfile = journey.beneficiary?.profile;
            const benName = benProfile?.firstName
              ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
              : 'Bénéficiaire';

            const activeObjectives = journey.objectives || [];
            const sessionsCount = journey.sessions?.length ?? 0;

            return (
              <Card
                key={journey.id}
                className="shadow-xs border-border hover:border-brand-primary/30 transition-colors"
              >
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs">
                        {(benName.charAt(0) || 'B').toUpperCase()}
                      </div>
                      <h3 className="font-bold text-base text-foreground">{benName}</h3>
                      <Badge
                        className={`text-[10px] ${
                          journey.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {journey.status === 'ACTIVE' ? 'Parcours actif' : journey.status}
                      </Badge>
                      {benProfile?.sector && (
                        <Badge variant="outline" className="text-[10px]">
                          {benProfile.sector}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-foreground">
                      Objectif : <span className="font-normal text-muted-foreground">{journey.mainObjective}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>{sessionsCount} séance{sessionsCount > 1 ? 's' : ''} réalisée{sessionsCount > 1 ? 's' : ''}</span>
                      <span>Démarré le {formatDate(journey.startedAt)}</span>
                      {activeObjectives.length > 0 && (
                        <span>{activeObjectives.length} jalon{activeObjectives.length > 1 ? 's' : ''} défini{activeObjectives.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xl font-bold text-brand-primary">
                        {journey.progressPercentage}%
                      </span>
                      <p className="text-[10px] text-muted-foreground">Progression globale</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="text-xs hover:text-brand-primary">
                      <Link href={`/mentor/journey/${journey.id}`}>
                        Voir la feuille de route
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState
            title="Aucun mentoré actif"
            description="Dès que vous acceptez une demande d'accompagnement sur la page des demandes, le parcours officiel du bénéficiaire apparaîtra ici."
            icon={Users}
            actionLabel="Voir les demandes reçues"
            onActionClick={() => redirect('/mentor/requests')}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function MentorJourneyPage() {
  return (
    <Suspense fallback={<MentorJourneySkeleton />}>
      <MentorJourneyContent />
    </Suspense>
  );
}
