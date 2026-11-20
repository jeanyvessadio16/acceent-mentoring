"use server";

import { apiRequest } from "@/lib/api/server-client";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import type { BeneficiaryDashboardData } from "@/types";

export interface CatalogMentorItem {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  pays: string;
  fonction: string;
  organisation: string;
  anneesExperience: number;
  expertises: string[];
  secteurs: string[];
  langues: string[];
  typesMentoring: string;
  disponibilites: string | null;
  biographie: string;
  photoUrl: string | null;
  isAvailable: boolean;
}

export interface MentorDetailItem extends CatalogMentorItem {
  linkedinUrl: string | null;
  publicsAccompagnes: string[];
  statutValidation: string;
}

export interface BeneficiaryOpportunityItem {
  id: string;
  titre: string;
  organisation: string;
  categorie: string;
  description: string;
  localisation: string | null;
  typeContrat: string | null;
  lienCandidature: string;
  dateExpiration: string;
  status: string;
}

export interface BeneficiaryMasterclassItem {
  id: string;
  titre: string;
  intervenant: string;
  description: string;
  categorie: string;
  dateSession: string;
  duree: number;
  lienLive: string | null;
  lienReplay: string | null;
  statut: string;
  maxParticipants: number | null;
}

interface DashboardMentorRef {
  id: string;
  userId: string;
  fonction: string | null;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  isAvailable?: boolean | null;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    pays?: string | null;
  } | null;
}

interface BeneficiaryDashboardApiResponse {
  user: {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role?: string;
    statutCompte: string;
    age?: number | null;
    sexe?: string | null;
    milieuResidence?: string | null;
    situationHandicap?: boolean;
    photoUrl?: string | null;
  };
  diagnostic: {
    id: string;
    domaine?: string;
    objectifPrincipal?: string;
    isCompleted: boolean;
  } | null;
  activePrograms: Array<{
    id: string;
    titre: string;
    progression: number;
    mentor?: {
      id: string;
      nom: string;
      prenom: string;
      email?: string;
      mentorProfile?: {
        fonction?: string | null;
        organisation?: string | null;
      } | null;
    } | null;
    goals?: Array<{ id: string }>;
    tasks?: Array<{ id: string }>;
  }>;
  upcomingSessions?: Array<{
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl: string | null;
    status: string;
    mentor?: {
      nom: string;
      prenom: string;
    } | null;
  }>;
  completedSessionsCount?: number;
  topRecommendations?: Array<{
    id: string;
    scoreTotal: number;
    justification: string;
    mentor: DashboardMentorRef | null;
  }>;
  fallbackMentors?: DashboardMentorRef[];
}

interface MentorApiRow {
  id: string;
  userId: string;
  fonction?: string | null;
  organisation?: string | null;
  anneesExperience?: number | null;
  expertises?: string[] | null;
  secteurs?: string[] | null;
  langues?: string[] | null;
  publicsAccompagnes?: string[] | null;
  typesMentoring?: string | null;
  disponibilites?: string | null;
  biographie?: string | null;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  statutValidation?: string | null;
  isAvailable?: boolean | null;
  user?: {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    pays?: string | null;
  } | null;
}

async function hasActiveAccountAccess(): Promise<boolean> {
  const meRes = await apiRequest<{ statutCompte?: string }>("/auth/me");
  if (!meRes.ok || !meRes.data) {
    return false;
  }
  return (
    meRes.data.statutCompte !== "SUSPENDED" &&
    meRes.data.statutCompte !== "REJECTED"
  );
}

/**
 * Server Action : Récupère les données réelles du tableau de bord bénéficiaire connecté
 * via `GET /dashboards/beneficiary`
 */
export async function getBeneficiaryDashboardAction(): Promise<BeneficiaryDashboardData | null> {
  const res = await apiRequest<BeneficiaryDashboardApiResponse>(
    "/dashboards/beneficiary"
  );

  if (!res.ok || !res.data) {
    return null;
  }

  const d = res.data;
  const userRole = d.user.role || "BENEFICIAIRE";
  if (
    d.user.statutCompte === "SUSPENDED" ||
    d.user.statutCompte === "REJECTED" ||
    (userRole !== "BENEFICIAIRE" && userRole !== "ADMIN")
  ) {
    return null;
  }

  const activePrograms = d.activePrograms || [];
  const firstProgram = activePrograms[0] ?? null;
  const activeProgram: BeneficiaryDashboardData["activeProgram"] = firstProgram
    ? {
        id: firstProgram.id,
        titre: firstProgram.titre,
        progression: Math.round(firstProgram.progression || 0),
        mentorName: firstProgram.mentor
          ? `${firstProgram.mentor.prenom} ${firstProgram.mentor.nom}`.trim()
          : "Mentor ACCEENT",
        mentorTitle: firstProgram.mentor?.mentorProfile?.fonction || undefined,
        mentorEmail: firstProgram.mentor?.email || undefined,
        goalsCount: firstProgram.goals?.length || 0,
        tasksCount: firstProgram.tasks?.length || 0,
      }
    : null;

  const upcomingSessions = (d.upcomingSessions || []).map((s) => ({
    id: s.id,
    titre: s.titre,
    mentorName: s.mentor
      ? `${s.mentor.prenom} ${s.mentor.nom}`.trim()
      : "Mentor",
    dateDebut: s.dateDebut,
    dateFin: s.dateFin,
    meetingUrl: sanitizeExternalUrl(s.meetingUrl),
    status: s.status,
  }));

  const recs = d.topRecommendations || [];
  const recommendedMentors: BeneficiaryDashboardData["recommendedMentors"] =
    recs.length > 0
      ? recs.map((m) => ({
          id: m.mentor?.id || m.id,
          mentorId: m.mentor?.userId || "",
          nom: m.mentor?.user?.nom || "",
          prenom: m.mentor?.user?.prenom || "",
          fonction: m.mentor?.fonction || "",
          organisation: m.mentor?.organisation || "",
          expertises: m.mentor?.expertises || [],
          anneesExperience: m.mentor?.anneesExperience || 0,
          isAvailable: m.mentor?.isAvailable ?? true,
          scoreTotal: m.scoreTotal,
          justification: m.justification,
        }))
      : (d.fallbackMentors || []).map((m) => ({
          id: m.id,
          mentorId: m.userId,
          nom: m.user?.nom || "",
          prenom: m.user?.prenom || "",
          fonction: m.fonction || "",
          organisation: m.organisation || "",
          expertises: m.expertises || [],
          anneesExperience: m.anneesExperience || 0,
          isAvailable: m.isAvailable ?? true,
        }));

  return {
    user: {
      id: d.user.id,
      email: d.user.email,
      prenom: d.user.prenom,
      nom: d.user.nom,
      role: userRole,
      statutCompte: d.user.statutCompte,
      age: d.user.age ?? null,
      sexe: d.user.sexe ?? null,
      milieuResidence: d.user.milieuResidence ?? null,
      situationHandicap: Boolean(d.user.situationHandicap),
      photoUrl: d.user.photoUrl || null,
    },
    hasCompletedDiagnosis: Boolean(d.diagnostic?.isCompleted),
    diagnostic: d.diagnostic
      ? {
          id: d.diagnostic.id,
          domaine: d.diagnostic.domaine,
          objectifPrincipal: d.diagnostic.objectifPrincipal,
          isCompleted: d.diagnostic.isCompleted,
        }
      : null,
    activeProgramsCount: activePrograms.length,
    upcomingSessionsCount: upcomingSessions.length,
    completedSessionsCount: d.completedSessionsCount ?? 0,
    averageProgress: activeProgram ? activeProgram.progression : 0,
    activeProgram,
    upcomingSessions,
    recommendedMentors,
  };
}

/**
 * Server Action : Récupère le catalogue réel des mentors validés via `GET /mentors`
 */
export async function getActiveMentorsCatalogAction(): Promise<
  CatalogMentorItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  const res = await apiRequest<{ data: MentorApiRow[] }>("/mentors", {
    auth: false,
    query: { limit: 50 },
  });

  if (!res.ok || !res.data?.data) {
    return [];
  }

  return res.data.data.map((m) => ({
    id: m.id,
    userId: m.userId,
    nom: m.user?.nom || "",
    prenom: m.user?.prenom || "",
    pays: m.user?.pays || "",
    fonction: m.fonction || "",
    organisation: m.organisation || "",
    anneesExperience: m.anneesExperience || 0,
    expertises: m.expertises || [],
    secteurs: m.secteurs || [],
    langues: m.langues || [],
    typesMentoring: m.typesMentoring || "INDIVIDUEL",
    disponibilites: m.disponibilites || null,
    biographie: m.biographie || "",
    photoUrl: sanitizeExternalUrl(m.photoUrl),
    isAvailable: Boolean(m.isAvailable),
  }));
}

/**
 * Server Action : Récupère le détail réel d'un mentor actif via `GET /mentors/:id`
 */
export async function getMentorDetailByIdAction(
  id: string
): Promise<MentorDetailItem | null> {
  if (!(await hasActiveAccountAccess())) {
    return null;
  }

  const res = await apiRequest<MentorApiRow>(`/mentors/${id}`, {
    auth: false,
  });

  if (!res.ok || !res.data) {
    return null;
  }

  const m = res.data;
  return {
    id: m.id,
    userId: m.userId,
    nom: m.user?.nom || "",
    prenom: m.user?.prenom || "",
    pays: m.user?.pays || "",
    fonction: m.fonction || "",
    organisation: m.organisation || "",
    anneesExperience: m.anneesExperience || 0,
    expertises: m.expertises || [],
    secteurs: m.secteurs || [],
    langues: m.langues || [],
    publicsAccompagnes: m.publicsAccompagnes || [],
    typesMentoring: m.typesMentoring || "INDIVIDUEL",
    disponibilites: m.disponibilites || null,
    biographie: m.biographie || "",
    photoUrl: sanitizeExternalUrl(m.photoUrl),
    linkedinUrl: sanitizeExternalUrl(m.linkedinUrl),
    statutValidation: m.statutValidation || "ACTIVE",
    isAvailable: Boolean(m.isAvailable),
  };
}

/**
 * Server Action : Récupère les opportunités actives via `GET /opportunities`
 */
export async function getBeneficiaryOpportunitiesAction(): Promise<
  BeneficiaryOpportunityItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  const res = await apiRequest<{ data: BeneficiaryOpportunityItem[] }>(
    "/opportunities",
    {
      auth: false,
      query: { status: "ACTIVE", limit: 50 },
    }
  );

  if (!res.ok || !res.data?.data) {
    return [];
  }

  return res.data.data;
}

/**
 * Server Action : Récupère les masterclasses via `GET /masterclasses`
 */
export async function getBeneficiaryMasterclassesAction(): Promise<
  BeneficiaryMasterclassItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  const res = await apiRequest<{ data: BeneficiaryMasterclassItem[] }>(
    "/masterclasses",
    {
      auth: false,
      query: { limit: 50 },
    }
  );

  if (!res.ok || !res.data?.data) {
    return [];
  }

  return res.data.data;
}
