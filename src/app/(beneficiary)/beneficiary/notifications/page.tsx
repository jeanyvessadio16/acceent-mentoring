import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { notificationsApi, NotificationItem } from '@/lib/api/notifications';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Calendar, MessageSquare, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

function NotificationsSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Notifications">
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

function getNotificationIcon(type: string) {
  switch (type.toUpperCase()) {
    case 'SESSION':
      return <Calendar className="w-4 h-4 text-brand-primary" />;
    case 'MESSAGE':
      return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    case 'OPPORTUNITY':
      return <Briefcase className="w-4 h-4 text-amber-600" />;
    case 'REQUEST':
      return <Award className="w-4 h-4 text-purple-600" />;
    default:
      return <Bell className="w-4 h-4 text-brand-primary" />;
  }
}

async function BeneficiaryNotificationsContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/notifications');
  }

  let notifications: NotificationItem[] = [];
  let userProfile = null;

  try {
    const [notifRes, userRes] = await Promise.all([
      notificationsApi.getMyNotifications(session.accessToken).catch(() => ({ items: [], total: 0, unreadCount: 0 })),
      usersApi.getMe(session.accessToken).catch(() => null),
    ]);
    notifications = notifRes.items || [];
    userProfile = userRes;
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/notifications');
    }
  }

  const profile = userProfile?.profile;
  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';

  return (
    <DashboardLayout role="BENEFICIARY" userName={fullName} pageTitle="Notifications">
      <PageHeader
        title="Centre de Notifications"
        description="Consultez l'historique des alertes concernant vos sessions, vos candidatures et vos messages."
      />

      <div className="space-y-4 max-w-4xl">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <Card
              key={item.id}
              className={`shadow-xs border-border transition-colors ${
                !item.isRead ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-card'
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="p-2 rounded-full bg-secondary shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs text-foreground">{item.title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                  {item.actionUrl && (
                    <div className="pt-1">
                      <Link
                        href={item.actionUrl}
                        className="text-[11px] text-brand-primary font-semibold hover:underline"
                      >
                        Voir les détails →
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous êtes à jour ! Vos prochaines alertes d'agenda, messages et opportunités apparaîtront ici."
            actionLabel="Retour au tableau de bord"
            actionHref="/beneficiary/dashboard"
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BeneficiaryNotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <BeneficiaryNotificationsContent />
    </Suspense>
  );
}

