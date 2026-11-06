import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { dashboardApi } from '@/lib/api/dashboard';
import { usersApi } from '@/lib/api/users';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Video,
  AlertCircle,
  Briefcase,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { formatDateTime, formatDate } from '@/lib/utils/formatters';

function MentorDashboardSkeleton() {
  return (
    <DashboardLayout role="MENTOR" userName="Chargement..." pageTitle="Tableau de bord Mentor">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

async function MentorDashboardContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/mentor/dashboard');
  }

  // Vérification de rôle
  if (session.role !== 'MENTOR' && session.role !== 'EXPERT' && session.role !== 'ADMIN') {
    redirect('/beneficiary/dashboard');
  }

  let userProfile = null;
  let mentorData = null;
  let fetchError: string | null = null;

  try {
    const [userRes, mentorDashRes] = await Promise.all([
      usersApi.getMe(session.accessToken).catch(() => null),
      dashboardApi.getMentorDashboard(session.accessToken).catch((err) => {
        fetchError = err?.message || 'Impossible de charger vos données mentor.';
        return null;
      }),
    ]);
    userProfile = userRes;
    mentorData = mentorDashRes;
  } catch (err: any) {
    if (err?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/mentor/dashboard');
    }
  }

  const profile = userProfile?.profile;
  const mentorFirstName = profile?.firstName || session.userName?.split(' ')[0] || 'Mentor';
  const mentorFullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : session.userName || 'Mentor ACCEENT';

  const mentorStatus = mentorData?.mentorStatus;
  const pendingRequests = mentorData?.requests || [];
  const activeMentees = mentorData?.mentees || [];
  const upcomingSessions = mentorData?.sessions || [];
  const averageRating = mentorStatus?.averageRating ?? 5.0;

  return (
    <DashboardLayout role="MENTOR" userName={mentorFullName} pageTitle="Tableau de bord Mentor">
      {fetchError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{fetchError}</p>
        </div>
      )}

      <PageHeader
        title={`Bonjour, ${mentorFirstName} 👋`}
        description="Gérez vos mentorés, répondez aux demandes d'accompagnement et suivez vos séances programmées."
      >
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/mentor/requests">Gérer les demandes ({pendingRequests.length})</Link>
          </Button>
          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
            <Link href="/mentor/sessions">Mon Agenda & Séances</Link>
          </Button>
        </div>
      </PageHeader>

      {/* Cartes de statistiques réelles alimentées par PostgreSQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Mentorés Actifs"
          value={String(activeMentees.length)}
          description={activeMentees.length > 0 ? 'Accompagnements en cours' : 'Aucun mentoré actif'}
          icon={Users}
        />
        <StatsCard
          title="Demandes en attente"
          value={String(pendingRequests.length)}
          description={pendingRequests.length > 0 ? 'À traiter rapidement' : 'Toutes traitées'}
          icon={Clock}
        />
        <StatsCard
          title="Séances à venir"
          value={String(upcomingSessions.length)}
          description="Inscrites à votre agenda"
          icon={Calendar}
        />
        <StatsCard
          title="Note d'évaluation"
          value={`${Number(averageRating).toFixed(1)} / 5`}
          description={
            mentorStatus?.validationStatus === 'APPROVED' ? 'Profil validé' : 'Validation en cours'
          }
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Demandes d'accompagnement récentes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  Demandes d'accompagnement reçues
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs text-brand-primary">
                  <Link href="/mentor/requests">Voir toutes ({pendingRequests.length})</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 3).map((req: any) => {
                  const benProfile = req.beneficiary?.profile;
                  const benName = benProfile?.firstName
                    ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
                    : 'Bénéficiaire';

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-border bg-card hover:border-brand-primary/30 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-foreground">{benName}</p>
                          {benProfile?.sector && (
                            <p className="text-[11px] text-brand-primary font-medium">
                              Secteur : {benProfile.sector}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {req.objective}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {req.expectedDuration}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-[11px] text-muted-foreground">
                          Reçue le {formatDate(req.createdAt)}
                        </span>
                        <Button asChild size="sm" variant="outline" className="text-xs h-7 px-2.5">
                          <Link href="/mentor/requests" className="flex items-center gap-1">
                            Traiter cette demande
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-40 text-brand-primary" />
                  <p className="font-medium text-foreground">Aucune demande en attente</p>
                  <p className="text-[11px]">
                    Vous avez répondu à toutes vos sollicitations de mentorat.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentorés actifs */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-primary" />
                  Mes mentorés actifs ({activeMentees.length})
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs text-brand-primary">
                  <Link href="/mentor/journey">Suivre les parcours</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {activeMentees.length > 0 ? (
                activeMentees.map((mentee: any) => {
                  const benProfile = mentee.beneficiary?.profile;
                  const name = benProfile?.firstName
                    ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
                    : 'Bénéficiaire';

                  return (
                    <div
                      key={mentee.journeyId}
                      className="p-3.5 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            Actif
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {mentee.mainObjective}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-brand-primary">
                            {mentee.progressPercentage}%
                          </span>
                          <p className="text-[10px] text-muted-foreground">Progression</p>
                        </div>
                        <Button asChild size="sm" variant="outline" className="text-xs">
                          <Link href="/mentor/journey">Feuille de route</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                  <p className="font-medium text-foreground">Aucun mentoré actif pour le moment</p>
                  <p className="text-[11px]">
                    Dès que vous acceptez une demande, votre mentoré apparaîtra ici avec sa feuille de route.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) : Prochaines sessions */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                Prochaines séances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((sessionItem: any) => (
                  <div
                    key={sessionItem.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {formatDateTime(sessionItem.startTime)}
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Confirmée
                      </Badge>
                    </div>
                    {sessionItem.meetingUrl && (
                      <Button asChild size="sm" className="w-full bg-brand-primary text-white text-xs h-7">
                        <a href={sessionItem.meetingUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          Rejoindre la visio
                        </a>
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs space-y-2">
                  <Calendar className="w-7 h-7 mx-auto opacity-40 text-brand-primary" />
                  <p className="font-medium text-foreground">Aucune séance planifiée</p>
                  <p className="text-[11px]">
                    Vos prochains rendez-vous confirmés s'afficheront ici.
                  </p>
                  <Button asChild size="sm" variant="outline" className="text-xs mt-2">
                    <Link href="/mentor/sessions">Ouvrir des créneaux</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statut du compte mentor */}
          <Card className="shadow-xs border-brand-primary/20 bg-linear-to-b from-brand-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                Mon Profil Expert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-foreground text-sm">{mentorFullName}</p>
                <p className="text-muted-foreground">{session.userEmail}</p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-muted-foreground">Disponibilité :</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                </span>
              </div>

              <Button asChild size="sm" variant="outline" className="w-full text-xs mt-2">
                <Link href="/mentor/profile">Modifier mon profil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MentorDashboardPage() {
  return (
    <Suspense fallback={<MentorDashboardSkeleton />}>
      <MentorDashboardContent />
    </Suspense>
  );
}
