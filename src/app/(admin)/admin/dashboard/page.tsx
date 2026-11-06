import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { usersApi } from '@/lib/api/users';
import { adminApi, AdminDashboardData, MentorCandidateItem } from '@/lib/api/admin';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  ShieldCheck,
  Award,
  Briefcase,
  ArrowUpRight,
  Clock,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

function AdminDashboardSkeleton() {
  return (
    <DashboardLayout role="ADMIN" userName="Chargement..." pageTitle="Supervision & Pilotage">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function AdminDashboardContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/admin/dashboard');
  }

  // Vérification stricte des permissions admin
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  let userProfile = null;
  let adminStats: AdminDashboardData | null = null;
  let pendingCandidates: MentorCandidateItem[] = [];
  let fetchError: string | null = null;

  try {
    const [userRes, statsRes, mentorsRes] = await Promise.all([
      usersApi.getMe(session.accessToken).catch(() => null),
      adminApi.getDashboard(session.accessToken).catch((err) => {
        fetchError = err?.message || 'Impossible de charger les métriques administrateur.';
        return null;
      }),
      adminApi
        .listMentors(session.accessToken, { status: 'PENDING', limit: 4 })
        .catch(() => ({ items: [], total: 0 })),
    ]);
    userProfile = userRes;
    adminStats = statsRes;
    pendingCandidates = mentorsRes?.items || [];
  } catch (err: any) {
    if (err?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/admin/dashboard');
    }
  }

  const profile = userProfile?.profile;
  const adminName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Administrateur ACCEENT';

  const pendingMentorsCount = adminStats?.pendingMentorValidations ?? pendingCandidates.length;

  return (
    <DashboardLayout role="ADMIN" userName={adminName} pageTitle="Supervision & Pilotage">
      {fetchError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{fetchError}</p>
        </div>
      )}

      <PageHeader
        title="Console de Supervision & Modération"
        description="Vue globale sur l'écosystème, les utilisateurs réels et les dossiers de candidatures mentors."
      >
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Link href="/admin/mentors-validation">
            Candidatures mentors ({pendingMentorsCount})
          </Link>
        </Button>
      </PageHeader>

      {/* Cartes de statistiques réelles calculées par PostgreSQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Utilisateurs Actifs"
          value={String(adminStats?.activeUsers ?? 0)}
          description={`+${adminStats?.newRegistrationsLast30Days ?? 0} ces 30 derniers jours`}
          icon={Users}
        />
        <StatsCard
          title="Mentors Validés"
          value={String(adminStats?.activeMentors ?? 0)}
          description={`${pendingMentorsCount} en attente de revue`}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Demandes de Mentoring"
          value={String(adminStats?.totalMentoringRequests ?? 0)}
          description={`${adminStats?.totalSessions ?? 0} séances enregistrées`}
          icon={Award}
        />
        <StatsCard
          title="Satisfaction Moyenne"
          value={
            adminStats?.averageSatisfaction && adminStats.averageSatisfaction > 0
              ? `${adminStats.averageSatisfaction} / 5`
              : '5.0 / 5'
          }
          description="Évaluations des sessions"
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidatures mentors en attente réelles */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              Candidatures Mentors à Valider ({pendingCandidates.length})
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-brand-primary">
              <Link href="/admin/mentors-validation" className="flex items-center gap-1">
                Gérer tout <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {pendingCandidates.length > 0 ? (
              pendingCandidates.map((cand) => {
                const userProfile = cand.user?.profile;
                const mentorName = userProfile?.firstName
                  ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
                  : cand.user?.email || 'Candidat Mentor';

                return (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl border border-border bg-card hover:border-brand-primary/30 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{mentorName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {cand.yearsOfExperience} ans d'exp.
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {[cand.jobTitle, cand.organization].filter(Boolean).join(' chez ')}
                      </p>
                      {cand.sectors && cand.sectors.length > 0 && (
                        <p className="text-[11px] text-brand-primary font-medium">
                          {cand.sectors.join(', ')}
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline" className="text-xs shrink-0 h-8">
                      <Link href="/admin/mentors-validation">Examiner</Link>
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 opacity-80" />
                <p className="font-semibold text-foreground">Toutes les candidatures sont traitées</p>
                <p className="text-[11px]">
                  Aucun dossier mentor n'est en attente de revue actuellement.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Synthèse des flux de la plateforme */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-primary" />
              Répartition & Activité Réelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <span className="font-semibold text-foreground block">
                Comptes et inscriptions
              </span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  Utilisateurs actifs :{' '}
                  <strong className="text-foreground">{adminStats?.activeUsers ?? 0}</strong>
                </div>
                <div>
                  Inscrits récents (30j) :{' '}
                  <strong className="text-foreground">
                    {adminStats?.newRegistrationsLast30Days ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <span className="font-semibold text-foreground block">
                Accompagnements & Échanges
              </span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  Demandes totales :{' '}
                  <strong className="text-foreground">
                    {adminStats?.totalMentoringRequests ?? 0}
                  </strong>
                </div>
                <div>
                  Séances tenues :{' '}
                  <strong className="text-foreground">{adminStats?.totalSessions ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <span className="font-semibold text-foreground block">Modération & Qualité</span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  Mentors validés :{' '}
                  <strong className="text-foreground">{adminStats?.activeMentors ?? 0}</strong>
                </div>
                <div>
                  Signalements ouverts :{' '}
                  <strong className="text-foreground">
                    {adminStats?.openModerationReports ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
