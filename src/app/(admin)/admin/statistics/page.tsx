import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { adminApi, ImpactKpiReport } from '@/lib/api/admin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatisticsClient } from '@/features/admin/AdminStatisticsClient';

function AdminStatisticsSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Statistiques & Impact">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function AdminStatisticsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/statistics');
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const defaultStats: ImpactKpiReport = {
    generatedAt: new Date().toISOString(),
    totalRegisteredUsers: 0,
    completedProfiles: 0,
    approvedMentors: 0,
    totalMatches: 0,
    totalSessions: 0,
    journeyCompletionRatePercentage: 0,
    averageSatisfactionScore: 0,
    totalMasterclasses: 0,
    totalOpportunities: 0,
    employmentOutcomes: 0,
    businessCreationOutcomes: 0,
    demographics: {
      sexe: { homme: 0, femme: 0 },
      milieuDeResidence: { urbain: 0, rural: 0 },
      sdh: { oui: 0, non: 0 },
    },
  };

  const [userProfile, statsRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    adminApi.getImpactStatistics(session.accessToken).catch(() => defaultStats),
  ]);

  const profile = userProfile?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Statistiques & Impact">
      <PageHeader
        title="Statistiques & Mesure d'Impact (F17)"
        description="Rapports d'impact agrégés et KPI réels d'insertion professionnelle, de création d'entreprise et d'inclusivité calculés sur la base de données."
      />

      <AdminStatisticsClient
        stats={statsRes || defaultStats}
        token={session.accessToken}
      />
    </DashboardLayout>
  );
}

export default function AdminStatisticsPage() {
  return (
    <Suspense fallback={<AdminStatisticsSkeleton />}>
      <AdminStatisticsContent />
    </Suspense>
  );
}

