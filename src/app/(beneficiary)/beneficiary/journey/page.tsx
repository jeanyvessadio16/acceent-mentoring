import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { journeysApi, MentoringJourneyItem } from '@/lib/api/journeys';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { JourneyProgressTracker } from '@/features/mentoring-journey/JourneyProgressTracker';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Award, Compass, Users } from 'lucide-react';

function JourneySkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Mon Parcours">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryJourneyContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/journey');
  }

  let journeys: MentoringJourneyItem[] = [];
  let userProfile = null;

  try {
    const [journeysRes, userRes] = await Promise.all([
      journeysApi.getMyJourneys(session.accessToken),
      usersApi.getMe(session.accessToken).catch(() => null),
    ]);
    journeys = journeysRes;
    userProfile = userRes;
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/journey');
    }
  }

  const profile = userProfile?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  // Récupérer le parcours actif en priorité, sinon le plus récent
  const activeJourney =
    journeys.find((j) => j.status === 'ACTIVE') || journeys[0] || null;

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Mon Parcours">
      <PageHeader
        title="Feuille de Route & Objectifs"
        description="Suivez votre progression étape par étape avec votre mentor et validez vos actions."
      >
        <div className="flex items-center gap-2">
          {!activeJourney ? (
            <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
              <Link href="/beneficiary/mentors" className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Trouver un mentor
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/beneficiary/diagnostic" className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Mon diagnostic
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>

      {activeJourney ? (
        <JourneyProgressTracker journey={activeJourney} />
      ) : (
        <EmptyState
          icon={Award}
          title="Aucun parcours de mentoring actif"
          description="Votre feuille de route personnalisée apparaîtra dès que vous aurez débuté un accompagnement avec un mentor. Vous pourrez y co-définir vos jalons et suivre vos tâches."
          actionLabel="Découvrir les mentors disponibles"
          actionHref="/beneficiary/mentors"
        />
      )}
    </DashboardLayout>
  );
}

export default function BeneficiaryJourneyPage() {
  return (
    <Suspense fallback={<JourneySkeleton />}>
      <BeneficiaryJourneyContent />
    </Suspense>
  );
}
