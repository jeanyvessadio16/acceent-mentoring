import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { adminApi } from '@/lib/api/admin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminUsersClient } from '@/features/admin/AdminUsersClient';

function AdminUsersSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Gestion des Utilisateurs">
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
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function AdminUsersContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/users');
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  const [userProfile, usersResponse] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    adminApi.listUsers(session.accessToken, { limit: 50 }).catch((err) => {
      console.error('Erreur récupération users admin:', err);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
      };
    }),
  ]);

  const profile = userProfile?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  const userItems = usersResponse.items || [];
  const totalCount = usersResponse.total || userItems.length;

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Gestion des Utilisateurs">
      <PageHeader
        title="Gestion & Supervision des Utilisateurs"
        description="Consultez l'ensemble des comptes de la plateforme issus de PostgreSQL, contrôlez leurs rôles et gérez leurs statuts d'accès."
      />

      <AdminUsersClient
        initialUsers={userItems}
        total={totalCount}
      />
    </DashboardLayout>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}
