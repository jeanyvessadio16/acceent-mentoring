import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DiagnosticWizard } from '@/features/diagnostic/DiagnosticWizard';
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

  const userRes = await usersApi.getMe(session.accessToken).catch(() => null);
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
        <DiagnosticWizard />
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

