import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { messagingApi, ConversationItem } from '@/lib/api/messaging';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ChatWindow } from '@/features/messaging/ChatWindow';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users } from 'lucide-react';

function MessagesSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Messagerie">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[550px] rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryMessagesContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/messages');
  }

  let conversations: ConversationItem[] = [];
  let userProfile = null;

  try {
    const [convsRes, userRes] = await Promise.all([
      messagingApi.getMyConversations(session.accessToken),
      usersApi.getMe(session.accessToken).catch(() => null),
    ]);
    conversations = convsRes;
    userProfile = userRes;
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/messages');
    }
  }

  const profile = userProfile?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Messagerie">
      <PageHeader
        title="Messagerie"
        description="Échangez directement avec votre mentor entre deux sessions pour poser vos questions et partager vos avancées."
      />

      {conversations.length > 0 ? (
        <ChatWindow
          initialConversations={conversations}
          currentUserId={session.userId || ''}
          token={session.accessToken}
        />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="Aucune discussion active"
          description="Votre messagerie s'activera automatiquement dès qu'un binôme sera formé avec un mentor. Vous pourrez échanger en toute fluidité."
          actionLabel="Rechercher un mentor"
          actionHref="/beneficiary/mentors"
        />
      )}
    </DashboardLayout>
  );
}

export default function BeneficiaryMessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <BeneficiaryMessagesContent />
    </Suspense>
  );
}
