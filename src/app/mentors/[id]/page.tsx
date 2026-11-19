import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const instant = false;

export const metadata: Metadata = {
  title: "Profil Mentor | ACCEENT Mentoring",
  description: "Consultez le parcours, les expertises et les disponibilités d'un mentor certifié ACCEENT.",
};

interface MentorDetailRecord {
  id: string;
  userId: string;
  fonction: string;
  organisation: string;
  anneesExperience: number;
  expertises: string[];
  secteurs: string[];
  langues: string[];
  publicsAccompagnes: string[];
  typesMentoring: string;
  disponibilites: string | null;
  biographie: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  statutValidation: string;
  isAvailable: boolean;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    pays: string;
  } | null;
}

export default async function MentorProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const adminDb = createAdminClient();

  const selectQuery = `
    id, userId, fonction, organisation, anneesExperience,
    expertises, secteurs, langues, publicsAccompagnes,
    typesMentoring, disponibilites, biographie, photoUrl,
    linkedinUrl, statutValidation, isAvailable,
    user:User!userId (id, nom, prenom, pays)
  `;

  // Recherche par MentorProfile.id puis fallback par MentorProfile.userId
  const byProfileId = await adminDb
    .from("MentorProfile")
    .select(selectQuery)
    .eq("id", id)
    .eq("statutValidation", "ACTIVE")
    .maybeSingle();

  let mentorRecord = byProfileId.data as MentorDetailRecord | null;

  if (!mentorRecord) {
    const byUserId = await adminDb
      .from("MentorProfile")
      .select(selectQuery)
      .eq("userId", id)
      .eq("statutValidation", "ACTIVE")
      .maybeSingle();
    mentorRecord = byUserId.data as MentorDetailRecord | null;
  }

  if (!mentorRecord) {
    notFound();
  }

  const userObj = Array.isArray(mentorRecord.user)
    ? mentorRecord.user[0]
    : mentorRecord.user;

  const fullName = userObj
    ? `${userObj.prenom} ${userObj.nom}`.trim()
    : "Mentor ACCEENT";
  const initials = userObj
    ? `${userObj.prenom?.[0] || ""}${userObj.nom?.[0] || "M"}`.toUpperCase()
    : "M";
  const safePhotoUrl = sanitizeExternalUrl(mentorRecord.photoUrl);
  const safeLinkedinUrl = sanitizeExternalUrl(mentorRecord.linkedinUrl);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href={ROUTES.DASHBOARDS.BENEFICIAIRE}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à mon tableau de bord</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
          {/* En-tête du mentor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-4">
              {safePhotoUrl ? (
                <img
                  src={safePhotoUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center shrink-0">
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
                  {userObj?.pays && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {userObj.pays}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Format : {mentorRecord.typesMentoring}
                  </span>
                </div>
              </div>
            </div>

            {safeLinkedinUrl && (
              <a
                href={safeLinkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors shrink-0"
              >
                <span>Profil LinkedIn</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Biographie */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Présentation & Parcours
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {mentorRecord.biographie}
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
        </div>
      </div>
    </div>
  );
}
