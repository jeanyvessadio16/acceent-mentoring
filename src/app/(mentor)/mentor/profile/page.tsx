import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { mentorsApi } from '@/lib/api/mentors';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MentorProfileForm } from '@/features/mentor-profile/MentorProfileForm';
import { Skeleton } from '@/components/ui/skeleton';

function MentorProfileSkeleton() {
  return (
    <DashboardLayout role="MENTOR" userName="Chargement..." pageTitle="Mon Profil Mentor">
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function MentorProfileContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/mentor/profile');
  }

  const [userRes, myProfileRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    mentorsApi.getMyProfile(session.accessToken).catch(() => null),
  ]);

  const profile = userRes?.profile;
  const mentorFullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Mentor ACCEENT';

  const mentorProfile = myProfileRes || userRes?.mentorProfile;

  return (
    <DashboardLayout role="MENTOR" userName={mentorFullName} pageTitle="Mon Profil Mentor">
      <PageHeader
        title="Profil Professionnel & Paramètres Mentor"
        description="Ces informations sont enregistrées dans la base de données et visibles par les bénéficiaires pour le matching."
      />

      <MentorProfileForm user={userRes} mentorProfile={mentorProfile} />
    </DashboardLayout>
  );
}

export default function MentorProfilePage() {
  return (
    <Suspense fallback={<MentorProfileSkeleton />}>
      <MentorProfileContent />
    </Suspense>
  );
}
