import React, { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionTokens } from '@/lib/auth/session';
import { dashboardApi } from '@/lib/api/dashboard';
import { usersApi } from '@/lib/api/users';
import { mentoringRequestsApi } from '@/lib/api/requests';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Video,
  AlertCircle,
  FileText,
  MapPin,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { formatDate, formatDateTime, formatSessionRange } from '@/lib/utils/formatters';

function getCategoryColor(category: string) {
  switch (category.toUpperCase()) {
    case 'EMPLOI':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'STAGE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'FORMATION':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'BOURSE':
    case 'FINANCEMENT':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CONCOURS':
    case 'APPEL_PROJETS':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

function getSessionStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">Confirmée</Badge>;
    case 'SCHEDULED':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-[10px]">Programmée</Badge>;
    case 'RESCHEDULED':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[10px]">Reportée</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
}

function BeneficiaryDashboardSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" userName="Chargement..." pageTitle="Tableau de bord">
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
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

async function BeneficiaryDashboardContent() {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/dashboard');
  }

  let userProfile = null;
  let dashboardData = null;
  let pendingRequests: any[] = [];
  let errorNotice: string | null = null;

  try {
    userProfile = await usersApi.getMe(session.accessToken);
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/dashboard');
    }
    errorNotice = error?.message || 'Impossible de charger votre profil.';
  }

  try {
    const [dashRes, requestsRes] = await Promise.all([
      dashboardApi.getBeneficiaryDashboard(session.accessToken).catch(() => null),
      mentoringRequestsApi.getMyRequests(session.accessToken).catch(() => []),
    ]);
    dashboardData = dashRes;
    pendingRequests = (requestsRes || []).filter((r: any) => r.status === 'PENDING');
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect('/login?sessionExpired=true&callbackUrl=/beneficiary/dashboard');
    }
  }

  const profileDetails = userProfile?.profile;
  const userFirstName = profileDetails?.firstName || session.userName?.split(' ')[0] || 'Bénéficiaire';
  const userFullName = profileDetails?.firstName
    ? `${profileDetails.firstName} ${profileDetails.lastName || ''}`.trim()
    : session.userName || 'Bénéficiaire ACCEENT';
  const userEmail = userProfile?.email || session.userEmail || '';
  const userPhone = userProfile?.phone || profileDetails?.phone || '';

  const myObjective = dashboardData?.myObjective;
  const progressPercentage = dashboardData?.myProgressPercentage ?? 0;
  const myMentor = dashboardData?.myMentor;
  const nextSession = dashboardData?.nextSession;
  const myActions = dashboardData?.myActions ?? [];
  const myResources = dashboardData?.myResources ?? [];
  const recommendedOpportunities = dashboardData?.recommendedOpportunities ?? [];
  const upcomingMasterclasses = dashboardData?.upcomingMasterclasses ?? [];

  return (
    <DashboardLayout role="BENEFICIARY" userName={userFullName} pageTitle="Tableau de bord">
      {errorNotice && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorNotice}</p>
        </div>
      )}

      {/* Demandes de mentorat en attente */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm text-amber-800">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Demande de mentorat en attente de réponse ({pendingRequests.length})</span>
          </div>
          <p className="text-amber-700">
            Vous avez sollicité un accompagnement auprès de{' '}
            <span className="font-semibold text-amber-900">
              {pendingRequests[0].mentorProfile?.user?.profile
                ? `${pendingRequests[0].mentorProfile.user.profile.firstName} ${pendingRequests[0].mentorProfile.user.profile.lastName}`
                : 'votre mentor'}
            </span>
            . Le mentor étudie votre demande. Vous recevrez une notification dès sa validation.
          </p>
        </div>
      )}

      {/* En-tête de bienvenue */}
      <PageHeader
        title={`Bonjour, ${userFirstName} 👋`}
        description="Voici l'état d'avancement de votre accompagnement et vos prochaines échéances."
      >
        <div className="flex flex-wrap items-center gap-2">
          {!myMentor ? (
            <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
              <Link href="/beneficiary/mentors">Trouver un mentor</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
              <Link href="/beneficiary/sessions">Mes sessions</Link>
            </Button>
          )}
          {!myObjective && (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/beneficiary/diagnostic">Faire mon diagnostic</Link>
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Carte d'identité du profil connecté avec ses données réelles */}
      <Card className="mb-6 border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-brand-accent/5 to-transparent shadow-xs">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
              {(userFirstName.charAt(0) || 'B').toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{userFullName}</h2>
                <Badge className="bg-brand-primary text-white text-[10px]">
                  Bénéficiaire
                </Badge>
                {userProfile?.status === 'ACTIVE' && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                    Compte vérifié
                  </Badge>
                )}
              </div>

              {/* Titre actuel et organisation réels issus de la base */}
              {(profileDetails?.currentTitle || profileDetails?.organization) && (
                <p className="text-xs font-semibold text-brand-primary flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  {[profileDetails.currentTitle, profileDetails.organization].filter(Boolean).join(' • ')}
                </p>
              )}

              {/* Niveau d'études réel */}
              {profileDetails?.educationLevel && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  Niveau : <span className="font-medium text-foreground">{profileDetails.educationLevel}</span>
                </p>
              )}

              {/* Coordonnées */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {userEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {userEmail}
                  </span>
                )}
                {(profileDetails?.city || profileDetails?.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[profileDetails.city, profileDetails.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {userPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {userPhone}
                  </span>
                )}
              </div>

              {/* Biographie réelle */}
              {profileDetails?.bio && (
                <p className="text-xs text-foreground/80 italic pt-1 line-clamp-2 max-w-2xl">
                  « {profileDetails.bio} »
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
            <div className="flex flex-wrap gap-1.5">
              {profileDetails?.sexe && (
                <Badge variant="outline" className="text-[10px]">
                  Sexe : {profileDetails.sexe === 'FEMME' ? 'Femme' : 'Homme'}
                </Badge>
              )}
              {profileDetails?.milieuDeResidence && (
                <Badge variant="outline" className="text-[10px]">
                  Milieu : {profileDetails.milieuDeResidence === 'RURAL' ? 'Rural' : 'Urbain'}
                </Badge>
              )}
              {profileDetails?.sdh && (
                <Badge variant="outline" className="text-[10px]">
                  SDH : {profileDetails.sdh === 'OUI' ? 'Oui' : 'Non'}
                </Badge>
              )}
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs mt-1">
              <Link href="/beneficiary/profile" className="flex items-center gap-1">
                Modifier mon profil
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de statistiques clés alimentées par la BDD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Progression Globale"
          value={`${progressPercentage}%`}
          description={myMentor ? "de la feuille de route" : "Démarrez un parcours"}
          icon={Target}
        />
        <StatsCard
          title="Mentor Assigné"
          value={myMentor ? '1' : '0'}
          description={
            myMentor
              ? `${myMentor.user.profile.firstName} ${myMentor.user.profile.lastName}`
              : 'Aucun mentor assigné'
          }
          icon={Users}
        />
        <StatsCard
          title="Prochaine Session"
          value={nextSession ? '1' : '0'}
          description={
            nextSession
              ? formatSessionRange(nextSession.startTime, nextSession.endTime)
              : 'Aucune session planifiée'
          }
          icon={Calendar}
        />
        <StatsCard
          title="Opportunités"
          value={recommendedOpportunities.length}
          description="Recommandations actives"
          icon={Briefcase}
        />
      </div>

      {/* Objectif principal (si défini dans le parcours ou le diagnostic) */}
      {myObjective && (
        <Card className="mb-6 border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-brand-accent/5 to-transparent shadow-xs">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                  Objectif prioritaire
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                {myObjective}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{progressPercentage}% réalisé</span>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs shrink-0 self-start sm:self-center">
              <Link href="/beneficiary/journey" className="flex items-center gap-1.5">
                Voir la feuille de route
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Principale (2/3) : Prochaine session & Feuille de route */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prochaine session */}
          <Card className="border-brand-primary/20 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  Prochaine session de mentoring
                </CardTitle>
                {nextSession && getSessionStatusBadge(nextSession.status)}
              </div>
            </CardHeader>
            <CardContent>
              {nextSession ? (
                <div className="p-4 rounded-xl bg-secondary/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm text-foreground">
                      {nextSession.title || "Session d'accompagnement et de suivi"}
                    </p>
                    {myMentor && (
                      <p className="text-xs text-muted-foreground">
                        Avec{' '}
                        <span className="font-medium text-foreground">
                          {myMentor.user.profile.firstName} {myMentor.user.profile.lastName}
                        </span>{' '}
                        ({myMentor.jobTitle || 'Mentor ACCEENT'})
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-brand-primary font-medium pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatSessionRange(nextSession.startTime, nextSession.endTime)}
                      </span>
                      {nextSession.meetingUrl && <span>• Visio en ligne</span>}
                    </div>
                  </div>
                  {nextSession.meetingUrl ? (
                    <Button
                      asChild
                      size="sm"
                      className="bg-brand-primary hover:bg-brand-secondary text-white text-xs shrink-0"
                    >
                      <a href={nextSession.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        Rejoindre la visio
                      </a>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs shrink-0"
                    >
                      <Link href="/beneficiary/sessions">
                        Voir les détails
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Aucune session planifiée"
                  description={
                    myMentor
                      ? "Vous n'avez pas de session à venir. Prenez contact avec votre mentor pour définir votre prochain rendez-vous d'échange."
                      : "Vous n'avez pas encore de mentor assigné. Parcourez notre annuaire pour trouver le mentor adapté à votre parcours."
                  }
                  actionLabel={myMentor ? "Planifier une session" : "Trouver un mentor"}
                  actionHref={myMentor ? "/beneficiary/sessions" : "/beneficiary/mentors"}
                />
              )}
            </CardContent>
          </Card>

          {/* Actions & Tâches à accomplir */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Mes actions prioritaires</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tâches définies avec votre mentor pour atteindre vos objectifs
                  </p>
                </div>
                <Link
                  href="/beneficiary/journey"
                  className="text-xs text-brand-primary hover:underline font-semibold"
                >
                  Voir tout mon parcours
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {myActions.length > 0 ? (
                <div className="space-y-3">
                  {myActions.map((task) => {
                    const isDone = task.status.toUpperCase() === 'DONE';
                    const isInProgress = task.status.toUpperCase() === 'IN_PROGRESS';

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors gap-2"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone
                                ? 'text-emerald-600 bg-emerald-50'
                                : isInProgress
                                ? 'text-amber-600 bg-amber-50'
                                : 'text-muted-foreground bg-muted'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <span
                              className={`text-xs font-medium block leading-snug ${
                                isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.objectiveTitle && (
                              <span className="inline-block text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                                {task.objectiveTitle}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.dueDate && (
                          <span className="text-[11px] text-muted-foreground shrink-0 sm:self-center pl-8 sm:pl-0">
                            Échéance : {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Target}
                  title="Aucune action en attente"
                  description="Votre feuille de route se mettra à jour automatiquement dès que des actions seront co-définies avec votre mentor."
                  actionLabel="Consulter mon parcours"
                  actionHref="/beneficiary/journey"
                />
              )}
            </CardContent>
          </Card>

          {/* Ressources partagées (si disponibles) */}
          {myResources.length > 0 && (
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  Ressources partagées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-3 rounded-lg border border-border flex items-center justify-between hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-primary" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{resource.title}</p>
                        <span className="text-[10px] text-muted-foreground uppercase">{resource.type}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="text-xs h-8">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        Accéder
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne Latérale (1/3) : Opportunités recommandées & Masterclasses */}
        <div className="space-y-6">
          {/* Opportunités recommandées */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  Opportunités pour vous
                </CardTitle>
                <Link
                  href="/beneficiary/opportunites"
                  className="text-xs text-brand-primary hover:underline font-semibold"
                >
                  Voir tout
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedOpportunities.length > 0 ? (
                recommendedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-lg border border-border bg-card space-y-2 hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`text-[9px] uppercase font-semibold ${getCategoryColor(opp.category)}`}>
                        {opp.category}
                      </Badge>
                      {opp.expiresAt && (
                        <span className="text-[10px] text-muted-foreground">
                          Jusqu'au {formatDate(opp.expiresAt)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground leading-snug line-clamp-2">
                        {opp.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 shrink-0" />
                          <span className="truncate">{opp.organization}</span>
                        </span>
                        {(opp.city || opp.country) && (
                          <span className="flex items-center gap-0.5">
                            • <MapPin className="w-3 h-3 shrink-0 ml-1" />
                            <span>{[opp.city, opp.country].filter(Boolean).join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-1">
                      {opp.externalUrl ? (
                        <a
                          href={opp.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          En savoir plus <ArrowRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          href={`/opportunites/${opp.id}`}
                          className="text-[11px] text-brand-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          En savoir plus <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="Aucune offre publiée"
                  description="De nouvelles opportunités de stages, concours et formations seront bientôt publiées."
                  actionLabel="Explorer l'espace opportunités"
                  actionHref="/beneficiary/opportunites"
                />
              )}
            </CardContent>
          </Card>

          {/* Masterclasses à venir */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-primary" />
                  Masterclasses à venir
                </CardTitle>
                <Link
                  href="/beneficiary/masterclasses"
                  className="text-xs text-brand-primary hover:underline font-semibold"
                >
                  Catalogue
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingMasterclasses.length > 0 ? (
                upcomingMasterclasses.map((mc) => (
                  <div
                    key={mc.id}
                    className="p-3.5 rounded-lg border border-border bg-card space-y-2 hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[9px] uppercase font-semibold text-brand-primary border-brand-primary/30">
                        {mc.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mc.durationMins} min
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground leading-snug line-clamp-2">
                        {mc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Par <span className="font-medium text-foreground">{mc.speakerName}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-brand-primary font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(mc.scheduledAt)}
                      </span>
                      <Link
                        href={`/masterclasses/${mc.id}`}
                        className="text-[11px] text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
                      >
                        S'inscrire <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="Aucun atelier programmé"
                  description="Consultez le catalogue pour découvrir les masterclasses passées et replays disponibles."
                  actionLabel="Consulter le catalogue"
                  actionHref="/beneficiary/masterclasses"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BeneficiaryDashboardPage() {
  return (
    <Suspense fallback={<BeneficiaryDashboardSkeleton />}>
      <BeneficiaryDashboardContent />
    </Suspense>
  );
}
