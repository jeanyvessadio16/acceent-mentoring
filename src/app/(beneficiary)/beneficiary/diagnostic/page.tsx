import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { diagnosticsApi } from '@/lib/api/diagnostics';
import { matchingApi } from '@/lib/api/matching';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DiagnosticPageClient } from '@/features/diagnostic/DiagnosticPageClient';
import { Skeleton } from '@/components/ui/skeleton';

function DiagnosticSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Mon Diagnostic">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryDiagnosticContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/diagnostic');
  }

  // Requêtes parallèles pour récupérer le profil, l'éligibilité, le diagnostic actuel et les recommandations
  const [userRes, eligibilityRes, currentDiagnosticRes] = await Promise.all([
    usersApi.getMe(session.accessToken).catch(() => null),
    diagnosticsApi.checkEligibility(session.accessToken).catch(() => null),
    diagnosticsApi.getCurrentDiagnostic(session.accessToken).catch(() => null),
  ]);

  let recommendations: any[] = [];
  if (currentDiagnosticRes) {
    try {
      const matchRes = await matchingApi.getRecommendations(session.accessToken, { limit: 6 });
      recommendations = matchRes.items || [];
    } catch {
      recommendations = [];
    }
  }

  const profile = userRes?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Mon Diagnostic">
      <PageHeader
        title="Diagnostic d'orientation et de besoins"
        description="Clarifiez votre objectif prioritaire et découvrez les mentors les plus adaptés à vos ambitions."
      />

      <div className="py-4">
        <DiagnosticPageClient
          userProfile={userRes}
          eligibility={eligibilityRes}
          currentDiagnostic={currentDiagnosticRes}
          recommendations={recommendations}
        />
      </div>
    </DashboardLayout>
  );
}

export default function BeneficiaryDiagnosticPage() {
  return (
    <Suspense fallback={<DiagnosticSkeleton />}>
      <BeneficiaryDiagnosticContent />
    </Suspense>
  );
}
