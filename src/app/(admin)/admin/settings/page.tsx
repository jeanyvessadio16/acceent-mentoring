import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { adminApi, MatchingWeights, MentoringProgramItem } from '@/lib/api/admin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminSettingsClient } from '@/features/admin/AdminSettingsClient';

function AdminSettingsSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Configuration Plateforme">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-80 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </DashboardLayout>
  );
}

async function AdminSettingsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/settings');
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const defaultWeights: MatchingWeights = {
    expertiseWeight: 30,
    objectiveWeight: 25,
    sectorWeight: 15,
    availabilityWeight: 10,
    languageWeight: 10,
    formatWeight: 10,
  };

  const [userProfile, weightsRes, programsRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    adminApi.getMatchingWeights(session.accessToken).catch(() => defaultWeights),
    adminApi.listPrograms(session.accessToken).catch(() => [] as MentoringProgramItem[]),
  ]);

  const profile = userProfile?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Configuration Plateforme">
      <PageHeader
        title="Paramètres de l'Algorithme & Programmes"
        description="Configurez les pondérations de compatibilité du moteur de matching (F05) et gérez les programmes institutionnels de mentoring (F16)."
      />

      <AdminSettingsClient
        initialWeights={weightsRes || defaultWeights}
        initialPrograms={programsRes || []}
      />
    </DashboardLayout>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<AdminSettingsSkeleton />}>
      <AdminSettingsContent />
    </Suspense>
  );
}

