import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

function ProfileSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Mon Profil">
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryProfileContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/profile');
  }

  let user = null;
  let fetchError: string | null = null;

  try {
    user = await usersApi.getMe(session.accessToken);
  } catch (err: any) {
    if (err?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/profile');
    }
    fetchError = err?.message || 'Impossible de récupérer votre profil.';
  }

  const profile = user?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Mon Profil">
      <PageHeader
        title="Paramètres de profil"
        description="Consultez et mettez à jour vos données personnelles, professionnelles et critères d'inclusion."
      />

      <div className="max-w-3xl space-y-6">
        {fetchError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{fetchError}</p>
          </div>
        )}

        {user && <ProfileForm user={user} />}
      </div>
    </DashboardLayout>
  );
}

export default function BeneficiaryProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <BeneficiaryProfileContent />
    </Suspense>
  );
}
