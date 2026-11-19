import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Inbox,
  Sparkles,
  Calendar,
  UserCheck,
  Clock,
  ArrowRight,
  Video,
  User,
} from "lucide-react";
import { getMentorWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const metadata: Metadata = {
  title: "Tableau de Bord Mentor | ACCEENT Mentoring",
  description: "Gérez vos mentorés, vos demandes entrantes et vos sessions d'accompagnement.",
};

export default async function MentorDashboardPage() {
  const data = await getMentorWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const statutValidation = data.mentorProfile?.statutValidation || "PENDING";
  const isActiveMentor = statutValidation === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Bannière d'accueil */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isActiveMentor
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            {isActiveMentor
              ? "Profil Mentor Validé & Actif"
              : "Profil Mentor en attente de validation"}
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {data.user.prenom || "Mentor"} !
          </h1>
          <p className="text-sm text-muted-foreground">
            Supervisez vos bénéficiaires, vos demandes d&apos;accompagnement et vos sessions planifiées.
          </p>
        </div>

        <Link
          href={ROUTES.MENTOR.PROFILE}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shrink-0 self-start sm:self-center"
        >
          <UserCheck className="h-4 w-4" />
          <span>Gérer mon profil</span>
        </Link>
      </div>

      {/* Alerte si le profil mentor n'est pas encore actif */}
      {!isActiveMentor && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-accent/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-accent/20 text-accent-foreground shrink-0">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900">
                Candidature en cours de vérification ({statutValidation})
              </h2>
              <p className="text-xs text-slate-600 max-w-xl">
                {data.mentorProfile
                  ? "L'équipe administrative examine votre dossier mentor. Assurez-vous que votre profil professionnel est complet."
                  : "Complétez votre profil mentor (fonction, organisation, biographie) pour soumettre votre dossier à la validation."}
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.MENTOR.APPLICATION}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-slate-950 bg-accent hover:bg-accent/90 transition-colors shrink-0 self-start sm:self-center"
          >
            <span>Suivre ma candidature</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </div>
      )}

      {/* KPIs réels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Mentorés actifs
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.activeProgramsCount}
          </p>
          <p className="text-xs text-secondary font-semibold">
            {data.programs.length} programme(s) au total
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Sessions dispensées
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.completedSessionsCount}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {data.upcomingSessions.length} session(s) à venir
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Demandes en attente
          </span>
          <p className="text-3xl font-extrabold text-foreground">
            {data.pendingRequestsCount}
          </p>
          <p className="text-xs text-amber-700 font-semibold">
            {data.requests.length} demande(s) reçue(s) au total
          </p>
        </div>
      </div>

      {/* Prochains rendez-vous + Accès rapides intra-espace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Prochaines sessions planifiées
              </h2>
              <p className="text-xs text-muted-foreground">
                Rendez-vous individuels confirmés avec vos mentorés
              </p>
            </div>
            <Link
              href={ROUTES.MENTOR.CALENDAR}
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              <span>Voir l&apos;agenda</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.upcomingSessions.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                Aucune session planifiée pour le moment
              </p>
              <p className="text-[11px] text-muted-foreground">
                Vos prochains rendez-vous avec vos bénéficiaires apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingSessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">{session.titre}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {session.menteeName}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(session.dateDebut).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {(() => {
                    const safeMeetingUrl = sanitizeExternalUrl(session.meetingUrl);
                    if (!safeMeetingUrl) return null;
                    return (
                      <a
                        href={safeMeetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Visio</span>
                      </a>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raccourcis intra-espace */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
            Navigation rapide Mentor
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Demandes reçues",
                desc: `${data.pendingRequestsCount} en attente`,
                href: ROUTES.MENTOR.REQUESTS,
                icon: Inbox,
                badgeCls: "bg-amber-100 text-amber-700",
              },
              {
                label: "Mes Mentorés",
                desc: `${data.activeProgramsCount} parcours actif(s)`,
                href: ROUTES.MENTOR.PARCOURS,
                icon: Sparkles,
                badgeCls: "bg-secondary/10 text-secondary",
              },
              {
                label: "Agenda & Sessions",
                desc: `${data.availabilitySlots.length} créneau(x) configuré(s)`,
                href: ROUTES.MENTOR.CALENDAR,
                icon: Calendar,
                badgeCls: "bg-blue-100 text-blue-700",
              },
              {
                label: "Mon Profil Mentor",
                desc: "Mettre à jour mes expertises",
                href: ROUTES.MENTOR.PROFILE,
                icon: UserCheck,
                badgeCls: "bg-emerald-100 text-emerald-700",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.badgeCls}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
