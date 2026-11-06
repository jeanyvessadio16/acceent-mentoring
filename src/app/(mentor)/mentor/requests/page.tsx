import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { mentoringRequestsApi, MentoringRequestItem } from '@/lib/api/requests';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MentorRequestsClient } from '@/features/mentor-requests/MentorRequestsClient';
import { Skeleton } from '@/components/ui/skeleton';

function MentorRequestsSkeleton() {
  return (
    <DashboardLayout role="MENTOR" userName="Chargement..." pageTitle="Demandes de mentorat">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-10 w-80 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function MentorRequestsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/mentor/requests');
  }

  // Vérification de sécurité du rôle
  if (session.role !== 'MENTOR' && session.role !== 'EXPERT' && session.role !== 'ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userRes, requestsRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    mentoringRequestsApi.getMyRequests(session.accessToken).catch(() => []),
  ]);

  const profile = userRes?.profile;
  const mentorFullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Mentor ACCEENT';

  const rawList = Array.isArray(requestsRes) ? requestsRes : requestsRes?.items || [];
  const requestsList: MentoringRequestItem[] = rawList;

  return (
    <DashboardLayout role="MENTOR" userName={mentorFullName} pageTitle="Demandes de mentorat">
      <PageHeader
        title="Gestion des demandes d'accompagnement"
        description="Examinez les besoins et objectifs des bénéficiaires et sélectionnez les mentorats que vous souhaitez encadrer."
      />

      <MentorRequestsClient initialRequests={requestsList} />
    </DashboardLayout>
  );
}

export default function MentorRequestsPage() {
  return (
    <Suspense fallback={<MentorRequestsSkeleton />}>
      <MentorRequestsContent />
    </Suspense>
  );
}
