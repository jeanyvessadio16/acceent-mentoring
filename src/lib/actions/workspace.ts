"use server";

import { apiRequest } from "@/lib/api/server-client";
import type { AdminDashboardStats } from "@/types";

export interface WorkspaceUserSummary {
  id: string;
  dbUserId: string | null;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  statutCompte: string;
  photoUrl?: string | null;
}

export interface MentorRequestItem {
  id: string;
  objectif: string;
  problematique: string;
  duree: string;
  frequence: string;
  format: string;
  message: string;
  status: string;
  createdAt: string;
  menteeName: string;
  menteeEmail: string;
}

export interface MentorProgramItem {
  id: string;
  titre: string;
  description: string | null;
  status: string;
  progression: number;
  startDate: string;
  menteeName: string;
  menteeEmail: string;
  goalsCount: number;
  tasksCount: number;
}

export interface WorkspaceSessionItem {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  meetingUrl: string | null;
  status: string;
  menteeName: string;
}

export interface MentorAvailabilitySlotItem {
  id: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  specificDate: string | null;
  isRecurring: boolean;
  isActive: boolean;
}

export interface MentorWorkspaceData {
  user: WorkspaceUserSummary;
  mentorProfile: {
    id: string;
    fonction: string;
    organisation: string;
    anneesExperience: number;
    expertises: string[];
    statutValidation: string;
    isAvailable: boolean;
    typesMentoring: string;
  } | null;
  requests: MentorRequestItem[];
  pendingRequestsCount: number;
  programs: MentorProgramItem[];
  activeProgramsCount: number;
  sessions: WorkspaceSessionItem[];
  upcomingSessions: WorkspaceSessionItem[];
  completedSessionsCount: number;
  availabilitySlots: MentorAvailabilitySlotItem[];
  openTasksCount: number;
  unreadMessagesCount: number;
}

export interface ExpertMasterclassItem {
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

export interface ExpertWorkspaceData {
  user: WorkspaceUserSummary;
  mentorProfile: {
    id: string;
    fonction: string;
    organisation: string;
    statutValidation: string;
  } | null;
  masterclasses: ExpertMasterclassItem[];
  sessions: WorkspaceSessionItem[];
  upcomingSessionsCount: number;
  completedSessionsCount: number;
}

export interface PartnerOpportunityItem {
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
  createdAt: string;
}

export interface PartnerWorkspaceData {
  user: WorkspaceUserSummary;
  opportunities: PartnerOpportunityItem[];
  activeOpportunitiesCount: number;
  stats: AdminDashboardStats;
}

const EMPTY_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalBeneficiaries: 0,
  totalMentors: 0,
  totalPartners: 0,
  pendingValidations: 0,
  activePrograms: 0,
  completedSessions: 0,
  satisfactionRate: 0,
  demographics: {
    femalePercentage: 0,
    malePercentage: 0,
    ruralPercentage: 0,
    urbanPercentage: 0,
    sdhPercentage: 0,
    averageAge: 0,
  },
};

interface MentorDashboardApiResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role?: string;
    statutCompte: string;
    photoUrl?: string | null;
  };
  mentorProfile: {
    id: string;
    fonction: string;
    organisation: string;
    anneesExperience: number;
    expertises: string[];
    statutValidation: string;
    isAvailable: boolean;
    typesMentoring: string;
  } | null;
  requests?: Array<{
    id: string;
    objectif: string;
    problematique: string;
    duree: string;
    frequence: string;
    format: string;
    message: string;
    status: string;
    createdAt: string;
    mentee?: {
      id: string;
      nom: string;
      prenom: string;
      email?: string;
    } | null;
  }>;
  pendingRequests?: Array<{ id: string }>;
  activePrograms?: Array<{
    id: string;
    titre: string;
    description: string | null;
    status: string;
    progression: number;
    startDate: string;
    mentee?: {
      id: string;
      nom: string;
      prenom: string;
      email?: string;
    } | null;
    _count?: {
      goals: number;
      tasks: number;
    };
  }>;
  sessions?: Array<{
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl: string | null;
    status: string;
    mentee?: {
      nom: string;
      prenom: string;
    } | null;
  }>;
  upcomingSessions?: Array<{
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl: string | null;
    status: string;
    mentee?: {
      nom: string;
      prenom: string;
    } | null;
  }>;
  completedSessionsCount?: number;
  activeSlots?: MentorAvailabilitySlotItem[];
  openTasksCount?: number;
  unreadMessagesCount?: number;
}

interface ExpertDashboardApiResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role?: string;
    statutCompte: string;
    photoUrl?: string | null;
  };
  mentorProfile: {
    id: string;
    fonction: string;
    organisation: string;
    statutValidation: string;
  } | null;
  masterclasses?: ExpertMasterclassItem[];
  sessions?: Array<{
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl: string | null;
    status: string;
    mentee?: {
      nom: string;
      prenom: string;
    } | null;
  }>;
  upcomingSessions?: Array<{ id: string }>;
  completedSessionsCount?: number;
}

interface PartnerDashboardApiResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    statutCompte?: string;
    photoUrl?: string | null;
  };
  opportunities?: PartnerOpportunityItem[];
  recentOpportunities?: PartnerOpportunityItem[];
  opportunitiesSummary?: {
    active: number;
    expired: number;
  };
  aggregatedStats?: AdminDashboardStats;
}

/**
 * Server Action : Récupère les données réelles de l'espace Mentor via `GET /dashboards/mentor`
 */
export async function getMentorWorkspaceDataAction(): Promise<MentorWorkspaceData | null> {
  const res = await apiRequest<MentorDashboardApiResponse>("/dashboards/mentor");
  if (!res.ok || !res.data) {
    return null;
  }

  const d = res.data;
  const user: WorkspaceUserSummary = {
    id: d.user.id,
    dbUserId: d.user.id,
    email: d.user.email,
    prenom: d.user.prenom || "",
    nom: d.user.nom || "",
    role: d.user.role || "MENTOR",
    statutCompte: d.user.statutCompte || "ACTIVE",
    photoUrl: d.user.photoUrl || null,
  };

  if (
    (user.role !== "MENTOR" && user.role !== "ADMIN") ||
    user.statutCompte === "SUSPENDED" ||
    user.statutCompte === "REJECTED"
  ) {
    return null;
  }

  const requests: MentorRequestItem[] = (d.requests || []).map((r) => ({
    id: r.id,
    objectif: r.objectif || "",
    problematique: r.problematique || "",
    duree: r.duree || "",
    frequence: r.frequence || "",
    format: r.format || "",
    message: r.message || "",
    status: r.status || "PENDING",
    createdAt: r.createdAt,
    menteeName: r.mentee
      ? `${r.mentee.prenom} ${r.mentee.nom}`.trim()
      : "Bénéficiaire",
    menteeEmail: r.mentee?.email || "",
  }));

  const programs: MentorProgramItem[] = (d.activePrograms || []).map((p) => ({
    id: p.id,
    titre: p.titre || "",
    description: p.description || null,
    status: p.status || "ACTIVE",
    progression: Math.round(p.progression || 0),
    startDate: p.startDate,
    menteeName: p.mentee
      ? `${p.mentee.prenom} ${p.mentee.nom}`.trim()
      : "Bénéficiaire",
    menteeEmail: p.mentee?.email || "",
    goalsCount: p._count?.goals ?? 0,
    tasksCount: p._count?.tasks ?? 0,
  }));

  const mapSession = (s: {
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    meetingUrl: string | null;
    status: string;
    mentee?: { nom: string; prenom: string } | null;
  }): WorkspaceSessionItem => ({
    id: s.id,
    titre: s.titre || "",
    dateDebut: s.dateDebut,
    dateFin: s.dateFin,
    meetingUrl: s.meetingUrl || null,
    status: s.status || "SCHEDULED",
    menteeName: s.mentee
      ? `${s.mentee.prenom} ${s.mentee.nom}`.trim()
      : "Bénéficiaire",
  });

  const sessions = (d.sessions || []).map(mapSession);
  const upcomingSessions = (d.upcomingSessions || []).map(mapSession);

  return {
    user,
    mentorProfile: d.mentorProfile
      ? {
          id: d.mentorProfile.id,
          fonction: d.mentorProfile.fonction || "",
          organisation: d.mentorProfile.organisation || "",
          anneesExperience: d.mentorProfile.anneesExperience || 0,
          expertises: d.mentorProfile.expertises || [],
          statutValidation: d.mentorProfile.statutValidation || "PENDING",
          isAvailable: Boolean(d.mentorProfile.isAvailable),
          typesMentoring: d.mentorProfile.typesMentoring || "INDIVIDUEL",
        }
      : null,
    requests,
    pendingRequestsCount:
      d.pendingRequests?.length ??
      requests.filter((r) => r.status === "PENDING").length,
    programs,
    activeProgramsCount: programs.filter((p) => p.status === "ACTIVE").length,
    sessions,
    upcomingSessions,
    completedSessionsCount:
      d.completedSessionsCount ??
      sessions.filter((s) => s.status === "COMPLETED").length,
    availabilitySlots: d.activeSlots || [],
    openTasksCount: d.openTasksCount ?? 0,
    unreadMessagesCount: d.unreadMessagesCount ?? 0,
  };
}

/**
 * Server Action : Récupère les données réelles de l'espace Expert via `GET /dashboards/expert`
 */
export async function getExpertWorkspaceDataAction(): Promise<ExpertWorkspaceData | null> {
  const res = await apiRequest<ExpertDashboardApiResponse>("/dashboards/expert");
  if (!res.ok || !res.data) {
    return null;
  }

  const d = res.data;
  const user: WorkspaceUserSummary = {
    id: d.user.id,
    dbUserId: d.user.id,
    email: d.user.email,
    prenom: d.user.prenom || "",
    nom: d.user.nom || "",
    role: d.user.role || "EXPERT",
    statutCompte: d.user.statutCompte || "ACTIVE",
    photoUrl: d.user.photoUrl || null,
  };

  if (
    (user.role !== "EXPERT" && user.role !== "ADMIN") ||
    user.statutCompte === "SUSPENDED" ||
    user.statutCompte === "REJECTED"
  ) {
    return null;
  }

  const sessions: WorkspaceSessionItem[] = (d.sessions || []).map((s) => ({
    id: s.id,
    titre: s.titre || "",
    dateDebut: s.dateDebut,
    dateFin: s.dateFin,
    meetingUrl: s.meetingUrl || null,
    status: s.status || "SCHEDULED",
    menteeName: s.mentee
      ? `${s.mentee.prenom} ${s.mentee.nom}`.trim()
      : "Participant",
  }));

  return {
    user,
    mentorProfile: d.mentorProfile
      ? {
          id: d.mentorProfile.id,
          fonction: d.mentorProfile.fonction || "",
          organisation: d.mentorProfile.organisation || "",
          statutValidation: d.mentorProfile.statutValidation || "PENDING",
        }
      : null,
    masterclasses:
      user.role === "ADMIN" || user.statutCompte === "ACTIVE"
        ? d.masterclasses || []
        : [],
    sessions,
    upcomingSessionsCount: d.upcomingSessions?.length ?? 0,
    completedSessionsCount: d.completedSessionsCount ?? 0,
  };
}

/**
 * Server Action : Récupère les données réelles de l'espace Partenaire via `GET /dashboards/partner`
 */
export async function getPartnerWorkspaceDataAction(): Promise<PartnerWorkspaceData | null> {
  const res = await apiRequest<PartnerDashboardApiResponse>(
    "/dashboards/partner"
  );
  if (!res.ok || !res.data) {
    return null;
  }

  const d = res.data;
  const user: WorkspaceUserSummary = {
    id: d.user.id,
    dbUserId: d.user.id,
    email: d.user.email,
    prenom: d.user.prenom || "",
    nom: d.user.nom || "",
    role: d.user.role || "PARTENAIRE",
    statutCompte: d.user.statutCompte || "ACTIVE",
    photoUrl: d.user.photoUrl || null,
  };

  if (
    (user.role !== "PARTENAIRE" && user.role !== "ADMIN") ||
    user.statutCompte === "SUSPENDED" ||
    user.statutCompte === "REJECTED"
  ) {
    return null;
  }

  if (user.role === "PARTENAIRE" && user.statutCompte !== "ACTIVE") {
    return {
      user,
      opportunities: [],
      activeOpportunitiesCount: 0,
      stats: EMPTY_STATS,
    };
  }

  const opportunities = d.opportunities || d.recentOpportunities || [];
  const activeOpportunitiesCount =
    d.opportunitiesSummary?.active ??
    opportunities.filter((o) => o.status === "ACTIVE").length;

  return {
    user,
    opportunities,
    activeOpportunitiesCount,
    stats: d.aggregatedStats ?? EMPTY_STATS,
  };
}
