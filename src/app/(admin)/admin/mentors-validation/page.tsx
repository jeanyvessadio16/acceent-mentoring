import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { adminApi, MentorCandidateItem } from '@/lib/api/admin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MentorsValidationClient } from '@/features/admin/MentorsValidationClient';
import { Skeleton } from '@/components/ui/skeleton';

function MentorsValidationSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Validation Mentors">
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

async function MentorsValidationContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/mentors-validation');
  }

  // Vérification stricte des permissions admin
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userRes, mentorsRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    adminApi.listMentors(session.accessToken).catch(() => ({ items: [], total: 0 })),
  ]);

  const profile = userRes?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  const candidatesList: MentorCandidateItem[] = mentorsRes?.items || [];

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Validation Mentors">
      <PageHeader
        title="Dossiers de candidatures mentors"
        description="Vérifiez les profils et expertises des candidats avant approbation publique sur la plateforme."
      />

      <MentorsValidationClient initialCandidates={candidatesList} />
    </DashboardLayout>
  );
}

export default function MentorsValidationPage() {
  return (
    <Suspense fallback={<MentorsValidationSkeleton />}>
      <MentorsValidationContent />
    </Suspense>
  );
}
