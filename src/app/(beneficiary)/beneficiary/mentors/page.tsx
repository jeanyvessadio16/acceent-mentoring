import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { mentorsApi } from '@/lib/api/mentors';
import { diagnosticsApi } from '@/lib/api/diagnostics';
import { matchingApi } from '@/lib/api/matching';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { BeneficiaryMentorsDirectory } from '@/features/mentor-search/BeneficiaryMentorsDirectory';
import { MentorProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function mapApiMentor(m: any): MentorProfile {
  return {
    id: m.id,
    firstName: m.user?.profile?.firstName || 'Mentor',
    lastName: m.user?.profile?.lastName || '',
    email: m.user?.email || '',
    role: 'MENTOR',
    status: 'ACTIVE',
    country: m.user?.profile?.country || 'Sénégal',
    city: m.user?.profile?.city || '',
    title: m.jobTitle || 'Mentor ACCEENT',
    company: m.organization || '',
    experienceYears: m.yearsOfExperience || 0,
    sectors: m.sectors || [],
    targetAudiences: m.targetAudiences || [],
    mentoringTypes: m.mentoringTypes || ['INDIVIDUAL'],
    rating: m.averageRating ?? 5.0,
    reviewCount: 0,
    isAvailable: m.isAvailable ?? true,
    validationStatus: m.validationStatus || 'APPROVED',
    skills: m.expertises || [],
    interests: [],
    languages: m.languages || ['Français'],
    bio: m.biography || '',
    createdAt: m.createdAt || '',
    updatedAt: m.updatedAt || '',
  };
}

function MentorsSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Trouver un Mentor">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryMentorsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/mentors');
  }

  // Requêtes parallèles pour récupérer le profil, tous les mentors, le diagnostic actif et le matching
  const [userRes, mentorsRes, currentDiagnosticRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    mentorsApi.searchMentors().catch(() => []),
    diagnosticsApi.getCurrentDiagnostic(session.accessToken).catch(() => null),
  ]);

  let recommendations: any[] = [];
  if (currentDiagnosticRes) {
    try {
      const matchRes = await matchingApi.getRecommendations(session.accessToken, { limit: 12 });
      recommendations = matchRes.items || [];
    } catch {
      recommendations = [];
    }
  }

  const rawList = Array.isArray(mentorsRes) ? mentorsRes : mentorsRes?.items || [];
  const allMentors = rawList.map(mapApiMentor);

  const profile = userRes?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Trouver un Mentor">
      <PageHeader
        title="Annuaire des Mentors & Matching Recommandé"
        description="Découvrez les mentors recommandés par notre algorithme selon votre diagnostic ou explorez l'annuaire complet."
      />

      <BeneficiaryMentorsDirectory
        allMentors={allMentors}
        recommendations={recommendations}
        currentDiagnostic={currentDiagnosticRes}
      />
    </DashboardLayout>
  );
}

export default function BeneficiaryMentorsPage() {
  return (
    <Suspense fallback={<MentorsSkeleton />}>
      <BeneficiaryMentorsContent />
    </Suspense>
  );
}
