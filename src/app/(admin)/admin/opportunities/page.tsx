import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminOpportunitiesClient } from '@/features/admin/AdminOpportunitiesClient';

function AdminOpportunitiesSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Gestion des Opportunités">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function AdminOpportunitiesContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/opportunities');
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userProfile, opportunitiesRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    opportunitiesApi.getAll().catch(() => ({ items: [], total: 0 })),
  ]);

  const profile = userProfile?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Gestion des Opportunités">
      <PageHeader
        title="Gestion & Diffusion des Opportunités"
        description="Publiez et supervisez les offres réelles d'emplois, de stages, de formations et d'appels à projets enregistrées dans la base de données."
      />

      <AdminOpportunitiesClient
        initialOpportunities={opportunitiesRes.items || []}
        total={opportunitiesRes.total || 0}
      />
    </DashboardLayout>
  );
}

export default function AdminOpportunitiesPage() {
  return (
    <Suspense fallback={<AdminOpportunitiesSkeleton />}>
      <AdminOpportunitiesContent />
    </Suspense>
  );
}

