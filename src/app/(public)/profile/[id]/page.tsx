import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Briefcase,
  ExternalLink,
  Globe,
  Lightbulb,
  Lock,
  MapPin,
  Target,
  UserX,
} from "lucide-react";

import { getPublicUserProfileAction } from "@/lib/actions/profile";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const instant = false;

export const metadata: Metadata = {
  title: "Profil Membre | ACCEENT Mentoring",
  description:
    "Consultez le profil communautaire d'un membre de la plateforme ACCEENT Mentoring.",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  BENEFICIAIRE: "Bénéficiaire",
  MENTOR: "Mentor",
  EXPERT: "Expert",
  PARTENAIRE: "Partenaire",
};

interface PublicMemberProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicMemberProfilePage({
  params,
}: PublicMemberProfilePageProps) {
  const { id } = await params;
  const result = await getPublicUserProfileAction(id);

  if (result.status === "unauthorized") {
    redirect(`${ROUTES.AUTH.LOGIN}?redirect=/profile/${encodeURIComponent(id)}`);
  }

  if (result.status === "private") {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-border p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Ce profil est privé
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ce membre a choisi de restreindre la visibilité publique de son
            profil conformément à ses paramètres de confidentialité.
          </p>
          <Link
            href={ROUTES.MENTORS_CATALOG}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Explorer le catalogue des mentors
          </Link>
        </div>
      </div>
    );
  }

  if (result.status !== "ok" || !result.data) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-border p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <UserX className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Profil introuvable
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Le profil demandé n&apos;existe pas ou n&apos;est plus actif sur la
            plateforme.
          </p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const user = result.data;
  const userProfile = user.profile;
  const mentorProfile = user.mentorProfile;
  const safePhotoUrl = sanitizeExternalUrl(userProfile?.photoUrl);
  const safeLinkedinUrl = sanitizeExternalUrl(mentorProfile?.linkedinUrl);
  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || "M"}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <section className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {safePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safePhotoUrl}
              alt={`${user.prenom} ${user.nom}`}
              className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary text-white font-extrabold text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground">
                {user.prenom} {user.nom}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>

            {(mentorProfile?.fonction || userProfile?.secteurActivite) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {mentorProfile?.fonction
                    ? `${mentorProfile.fonction}${
                        mentorProfile.organisation
                          ? ` · ${mentorProfile.organisation}`
                          : ""
                      }`
                    : userProfile?.secteurActivite}
                </span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {(userProfile?.ville || user.pays) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[userProfile?.ville, user.pays].filter(Boolean).join(", ")}
                </span>
              )}
              {userProfile?.langues && userProfile.langues.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {userProfile.langues.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {safeLinkedinUrl && (
            <a
              href={safeLinkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {mentorProfile?.id && (
            <Link
              href={ROUTES.BENEFICIARY.MENTOR_DETAIL(mentorProfile.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Fiche mentor</span>
            </Link>
          )}
        </div>
      </section>

      {mentorProfile?.biographie && (
        <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-2">
          <h2 className="text-sm font-bold text-foreground">Présentation</h2>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {mentorProfile.biographie}
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-secondary" />
            <span>Compétences &amp; Expertises</span>
          </h2>
          {(() => {
            const tags = [
              ...(mentorProfile?.expertises ?? []),
              ...(userProfile?.competences ?? []),
            ];
            const uniqueTags = Array.from(new Set(tags));
            return uniqueTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune compétence publique renseignée pour le moment.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {uniqueTags.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            );
          })()}
        </section>

        <section className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Objectifs &amp; Centres d&apos;intérêt</span>
          </h2>
          {(() => {
            const items = [
              ...(userProfile?.objectifs ?? []),
              ...(userProfile?.centresInteret ?? []),
            ];
            const uniqueItems = Array.from(new Set(items));
            return uniqueItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucun objectif ou centre d&apos;intérêt partagé publiquement.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {uniqueItems.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
