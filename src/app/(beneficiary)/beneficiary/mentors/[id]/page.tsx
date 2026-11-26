import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { getMentorDetailByIdAction } from "@/lib/actions/beneficiary";
import { listMentorshipRequestsAction } from "@/lib/actions/mentoring";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { MentorshipRequestButton } from "@/features/mentoring/MentorshipRequestButton";
import { BookSessionButton } from "@/features/sessions/BookSessionButton";
import { ReportModalButton } from "@/features/moderation/ReportModalButton";

export const instant = false;

export const metadata: Metadata = {
  title: "Profil Mentor | Espace Bénéficiaire ACCEENT Mentoring",
  description: "Consultez le parcours, les expertises et les disponibilités d'un mentor certifié ACCEENT.",
};

export default async function BeneficiaryMentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [mentorRecord, sentRequestsRes] = await Promise.all([
    getMentorDetailByIdAction(id),
    listMentorshipRequestsAction("sent"),
  ]);

  if (!mentorRecord) {
    notFound();
  }

  const mentorRequests = sentRequestsRes.data.filter(
    (req) => req.mentorId === mentorRecord.userId
  );
  const acceptedRequest = mentorRequests.find(
    (req) =>
      req.status === "ACCEPTED" &&
      req.program?.status !== "CANCELLED" &&
      req.program?.status !== "COMPLETED"
  );
  const pendingRequest = !acceptedRequest
    ? mentorRequests.find((req) => req.status === "PENDING")
    : undefined;

  const fullName = `${mentorRecord.prenom} ${mentorRecord.nom}`.trim() || "Mentor ACCEENT";
  const initials =
    `${mentorRecord.prenom?.[0] || ""}${mentorRecord.nom?.[0] || "M"}`.toUpperCase() || "M";
  const safePhotoUrl = sanitizeExternalUrl(mentorRecord.photoUrl);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.BENEFICIARY.MENTORS}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;annuaire des mentors</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
        {/* En-tête du mentor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {safePhotoUrl ? (
              <img
                src={safePhotoUrl}
                alt={fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover object-top border-2 border-border shadow-sm shrink-0"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-primary text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-sm shrink-0">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                  <Award className="h-3 w-3" />
                  Mentor certifié
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {mentorRecord.fonction}
                  {mentorRecord.organisation ? ` · ${mentorRecord.organisation}` : ""}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>{mentorRecord.anneesExperience} ans d&apos;expérience</span>
                {mentorRecord.pays && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {mentorRecord.pays}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Format : {mentorRecord.typesMentoring}
                </span>
              </div>
            </div>
          </div>

          {(() => {
            const safeLinkedinUrl = sanitizeExternalUrl(mentorRecord.linkedinUrl);
            if (!safeLinkedinUrl) return null;
            return (
              <a
                href={safeLinkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors shrink-0"
              >
                <span>Profil LinkedIn</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            );
          })()}
        </div>

        {/* Biographie */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Présentation &amp; Parcours
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {mentorRecord.biographie || "Biographie non encore renseignée."}
          </p>
        </div>

        {/* Expertises & Secteurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Domaines d&apos;expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {mentorRecord.expertises?.length > 0 ? (
                mentorRecord.expertises.map((exp, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {exp}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Non précisé</span>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Secteurs d&apos;activité
            </h3>
            <div className="flex flex-wrap gap-2">
              {mentorRecord.secteurs?.length > 0 ? (
                mentorRecord.secteurs.map((sec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                  >
                    {sec}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Non précisé</span>
              )}
            </div>
          </div>
        </div>

        {/* Langues & Disponibilités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="flex items-start gap-2.5">
            <Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Langues parlées</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mentorRecord.langues?.length > 0
                  ? mentorRecord.langues.join(", ")
                  : "Non renseigné"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Disponibilités</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mentorRecord.disponibilites ||
                  (mentorRecord.isAvailable
                    ? "Disponible sur demande"
                    : "Temporairement indisponible")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions bénéficiaire (F07 Demande, F09 Session après acceptation, F16 Signalement) */}
        <div className="pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {acceptedRequest ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Demande acceptée · Accompagnement actif</span>
                </span>
                <BookSessionButton
                  mentorId={mentorRecord.userId}
                  mentorName={fullName}
                  programId={acceptedRequest.program?.id}
                  isAvailable={mentorRecord.isAvailable}
                />
                <Link
                  href={ROUTES.BENEFICIARY.PARCOURS}
                  className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Voir mon parcours
                </Link>
              </>
            ) : pendingRequest ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Demande de mentorat en attente — vous pourrez réserver une session dès son acceptation
                  </span>
                </span>
                <Link
                  href={ROUTES.BENEFICIARY.PARCOURS}
                  className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  Suivre ma demande
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                <MentorshipRequestButton
                  mentorId={mentorRecord.userId}
                  mentorName={fullName}
                  isAvailable={mentorRecord.isAvailable}
                />
                <p className="text-[11px] text-muted-foreground">
                  La réservation de session est accessible une fois votre demande de mentorat acceptée.
                </p>
              </div>
            )}
          </div>

          <ReportModalButton
            reportedUserId={mentorRecord.userId}
            targetType="MENTOR"
            targetId={mentorRecord.id}
            label="Signaler ce profil"
          />
        </div>
      </div>
    </div>
  );
}
