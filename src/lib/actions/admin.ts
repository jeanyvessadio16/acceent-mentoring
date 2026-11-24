"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import type {
  AdminDashboardStats,
  PendingValidationItem,
  RecentAdminActivity,
} from "@/types";

export interface CurrentAdminUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  photoUrl?: string | null;
}

export interface RealOpportunityRow {
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

export interface RealMasterclassRow {
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
  createdAt: string;
}

export interface RealDatabaseUser {
  id: string;
  supabaseUid?: string | null;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  pays: string;
  role: string;
  statutCompte: string;
  age?: number | null;
  sexe?: string | null;
  milieuResidence?: string | null;
  situationHandicap: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_PLATFORM_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalBeneficiaries: 0,
  totalMentors: 0,
  totalPartners: 0,
  pendingValidations: 0,
  activePrograms: 0,
  completedSessions: 0,
  satisfactionRate: 0,
  activeUsers: 0,
  newUsersLast30Days: 0,
  completedProfilesCount: 0,
  activeMentorsCount: 0,
  totalMatchesCount: 0,
  totalRequestsCount: 0,
  pendingRequestsCount: 0,
  completedProgramsCount: 0,
  programCompletionRate: 0,
  totalSessionsCount: 0,
  averageSatisfactionRating: null,
  masterclassesCount: 0,
  masterclassRegistrationsCount: 0,
  totalOpportunitiesCount: 0,
  activeOpportunitiesCount: 0,
  employmentStageOpportunitiesCount: 0,
  pendingReportsCount: 0,
  demographics: {
    femalePercentage: 0,
    malePercentage: 0,
    ruralPercentage: 0,
    urbanPercentage: 0,
    sdhPercentage: 0,
    averageAge: 0,
  },
};

interface AuthMeAdminResponse {
  id: string;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  role: string;
  statutCompte: string;
  profile?: { photoUrl?: string | null } | null;
}

interface AdminStatsApiResponse {
  kpis: {
    totalUsers: number;
    activeUsers?: number;
    newUsersLast30Days?: number;
    completedProfilesCount?: number;
    activeMentorsCount?: number;
    pendingValidationsCount: number;
    totalMatchesCount?: number;
    totalRequestsCount?: number;
    pendingRequestsCount?: number;
    activeProgramsCount: number;
    completedProgramsCount?: number;
    programCompletionRate?: number;
    totalSessionsCount?: number;
    completedSessionsCount: number;
    averageSatisfactionRating?: number | null;
    satisfactionRate?: number;
    masterclassesCount?: number;
    masterclassRegistrationsCount?: number;
    totalOpportunitiesCount?: number;
    activeOpportunitiesCount?: number;
    employmentStageOpportunitiesCount?: number;
    pendingReportsCount?: number;
  };
  demographics: {
    byRole?: Record<string, number>;
    femalePercentage?: number;
    malePercentage?: number;
    ruralPercentage?: number;
    urbanPercentage?: number;
    sdhPercentage?: number;
    averageAge?: number;
  };
}

interface PendingCandidateApiRow {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  createdAt: string;
  mentorProfile?: {
    id: string;
    fonction?: string | null;
    organisation?: string | null;
    anneesExperience?: number | null;
    expertises?: string[] | null;
    secteurs?: string[] | null;
    biographie?: string | null;
    cvUrl?: string | null;
    signedCvUrl?: string | null;
    linkedinUrl?: string | null;
    references?: string | null;
    typesMentoring?: string | null;
    disponibilites?: string | null;
  } | null;
}

/**
 * Server Action : Récupère les données réelles de l'administrateur connecté via `GET /auth/me`
 */
export async function getCurrentAdminUserAction(): Promise<CurrentAdminUser | null> {
  const res = await apiRequest<AuthMeAdminResponse>("/auth/me");
  if (!res.ok || !res.data) {
    return null;
  }

  const dbUser = res.data;
  if (
    dbUser.role !== "ADMIN" ||
    dbUser.statutCompte === "SUSPENDED" ||
    dbUser.statutCompte === "REJECTED"
  ) {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    nom: dbUser.nom || "",
    prenom: dbUser.prenom || "",
    role: dbUser.role,
    photoUrl: dbUser.profile?.photoUrl || null,
  };
}

/**
 * Server Action : Récupère les métriques agrégées via `GET /admin/stats`
 */
export async function getAdminStatsAction(): Promise<AdminDashboardStats> {
  const res = await apiRequest<AdminStatsApiResponse>("/admin/stats");
  if (!res.ok || !res.data) {
    return EMPTY_PLATFORM_STATS;
  }

  const { kpis, demographics } = res.data;
  const byRole = demographics.byRole || {};

  return {
    totalUsers: kpis.totalUsers ?? 0,
    totalBeneficiaries: byRole.BENEFICIAIRE ?? 0,
    totalMentors: byRole.MENTOR ?? 0,
    totalPartners: byRole.PARTENAIRE ?? 0,
    pendingValidations: kpis.pendingValidationsCount ?? 0,
    activePrograms: kpis.activeProgramsCount ?? 0,
    completedSessions: kpis.completedSessionsCount ?? 0,
    satisfactionRate: kpis.satisfactionRate ?? 0,
    activeUsers: kpis.activeUsers ?? 0,
    newUsersLast30Days: kpis.newUsersLast30Days ?? 0,
    completedProfilesCount: kpis.completedProfilesCount ?? 0,
    activeMentorsCount: kpis.activeMentorsCount ?? 0,
    totalMatchesCount: kpis.totalMatchesCount ?? 0,
    totalRequestsCount: kpis.totalRequestsCount ?? 0,
    pendingRequestsCount: kpis.pendingRequestsCount ?? 0,
    completedProgramsCount: kpis.completedProgramsCount ?? 0,
    programCompletionRate: kpis.programCompletionRate ?? 0,
    totalSessionsCount: kpis.totalSessionsCount ?? 0,
    averageSatisfactionRating: kpis.averageSatisfactionRating ?? null,
    masterclassesCount: kpis.masterclassesCount ?? 0,
    masterclassRegistrationsCount: kpis.masterclassRegistrationsCount ?? 0,
    totalOpportunitiesCount: kpis.totalOpportunitiesCount ?? 0,
    activeOpportunitiesCount: kpis.activeOpportunitiesCount ?? 0,
    employmentStageOpportunitiesCount: kpis.employmentStageOpportunitiesCount ?? 0,
    pendingReportsCount: kpis.pendingReportsCount ?? 0,
    demographics: {
      femalePercentage: demographics.femalePercentage ?? 0,
      malePercentage: demographics.malePercentage ?? 0,
      ruralPercentage: demographics.ruralPercentage ?? 0,
      urbanPercentage: demographics.urbanPercentage ?? 0,
      sdhPercentage: demographics.sdhPercentage ?? 0,
      averageAge: demographics.averageAge ?? 0,
    },
  };
}

/**
 * Server Action : Récupère les profils en attente de validation via `GET /admin/validations/pending`
 */
export async function getPendingValidationsAction(): Promise<
  PendingValidationItem[]
> {
  const res = await apiRequest<PendingCandidateApiRow[]>(
    "/admin/validations/pending"
  );

  if (!res.ok || !res.data) {
    return [];
  }

  return res.data.map((u) => {
    const profile = u.mentorProfile;
    const dateStr = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date non renseignée";

    const rawRole = u.role?.toLowerCase();
    const normalizedRole: PendingValidationItem["role"] =
      rawRole === "expert"
        ? "expert"
        : rawRole === "partenaire" || rawRole === "partner"
        ? "partner"
        : "mentor";

    return {
      id: u.id,
      userId: u.id,
      firstName: u.prenom || "",
      lastName: u.nom || "",
      email: u.email,
      role: normalizedRole,
      title:
        normalizedRole === "partner"
          ? profile?.fonction || "Compte Partenaire"
          : profile?.fonction || "Candidat Mentor / Expert",
      organization: profile?.organisation || undefined,
      yearsOfExperience: profile?.anneesExperience || 0,
      expertises: profile?.expertises || [],
      sectors: profile?.secteurs || [],
      bio: profile?.biographie || undefined,
      cvUrl: sanitizeExternalUrl(profile?.signedCvUrl || profile?.cvUrl),
      linkedinUrl: sanitizeExternalUrl(profile?.linkedinUrl),
      mentoringFormat: profile?.typesMentoring || undefined,
      availability: profile?.disponibilites || null,
      references: profile?.references || null,
      submittedAt: dateStr,
      status: "pending" as const,
    };
  });
}

/**
 * Server Action : Valide, réactive ou suspend un utilisateur via `PATCH /admin/users/:id/status`
 */
export async function updateUserStatusAction(
  userId: string,
  newStatus: "approved" | "rejected" | "suspended" | "active"
): Promise<{ success: boolean; message: string }> {
  const dbStatus =
    newStatus === "approved" || newStatus === "active"
      ? "ACTIVE"
      : newStatus === "rejected"
      ? "REJECTED"
      : "SUSPENDED";

  const res = await apiRequest(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: { status: dbStatus },
  });

  if (!res.ok) {
    return {
      success: false,
      message: res.error || "Erreur lors de la mise à jour du statut.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/validations");
  revalidatePath("/admin/users");
  revalidatePath("/beneficiary/mentors");
  revalidatePath("/dashboard/beneficiaire");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/mentors");

  return {
    success: true,
    message:
      dbStatus === "ACTIVE"
        ? "Le compte a été activé avec succès."
        : dbStatus === "SUSPENDED"
        ? "Le compte a été suspendu."
        : "Le profil a été rejeté.",
  };
}

export type AdminAssignableRole =
  | "BENEFICIAIRE"
  | "MENTOR"
  | "EXPERT"
  | "PARTENAIRE"
  | "ADMIN";

/**
 * Server Action : Modifie le rôle d'un utilisateur via `PATCH /admin/users/:id/role`
 */
export async function updateUserRoleAction(
  userId: string,
  role: AdminAssignableRole
): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });

  if (!res.ok) {
    return {
      success: false,
      message: res.error || "Erreur lors de la modification du rôle.",
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/validations");

  return {
    success: true,
    message: `Rôle mis à jour vers ${role}.`,
  };
}

export interface AdminProgramItem {
  id: string;
  titre: string;
  status: string;
  progression: number;
  startDate: string;
  createdAt: string;
  mentor: { id: string; nom: string; prenom: string; email: string };
  mentee: { id: string; nom: string; prenom: string; email: string };
  _count: { goals: number; tasks: number; sessions: number };
}

export interface AdminSessionItem {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  status: string;
  rating: number | null;
  meetingUrl: string | null;
  mentor: { id: string; nom: string; prenom: string; email: string };
  mentee: { id: string; nom: string; prenom: string; email: string };
}

export async function getAdminProgramsAction(
  page = 1,
  limit = 50
): Promise<AdminProgramItem[]> {
  const res = await apiRequest<{ data: AdminProgramItem[] }>("/admin/programs", {
    query: { page: Math.max(1, page), limit: Math.min(Math.max(1, limit), 50) },
  });
  if (!res.ok || !res.data?.data) {
    return [];
  }
  return res.data.data;
}

export async function getAdminSessionsAction(
  page = 1,
  limit = 50
): Promise<AdminSessionItem[]> {
  const res = await apiRequest<{ data: AdminSessionItem[] }>("/admin/sessions", {
    query: { page: Math.max(1, page), limit: Math.min(Math.max(1, limit), 50) },
  });
  if (!res.ok || !res.data?.data) {
    return [];
  }
  return res.data.data;
}

/**
 * Server Action : Récupère la liste paginée des utilisateurs via `GET /admin/users`
 */
export async function getRealUsersListAction(
  page = 1,
  limit = 50
): Promise<RealDatabaseUser[]> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);

  const res = await apiRequest<{
    data: RealDatabaseUser[];
    meta?: { totalPages?: number };
  }>("/admin/users", {
    query: { page: safePage, limit: safeLimit },
  });

  if (!res.ok || !res.data?.data) {
    return [];
  }

  const users = [...res.data.data];
  const totalPages = Math.min(res.data.meta?.totalPages ?? 1, 10);

  if (page === 1 && totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        apiRequest<{ data: RealDatabaseUser[] }>("/admin/users", {
          query: { page: index + 2, limit: safeLimit },
        })
      )
    );
    for (const pageRes of remainingPages) {
      if (pageRes.ok && pageRes.data?.data) {
        users.push(...pageRes.data.data);
      }
    }
  }

  return users;
}

/**
 * Server Action : Synchronise les comptes Supabase Auth manquants via `POST /admin/users/sync`
 */
export async function syncAuthUsersToDatabaseAction(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  const res = await apiRequest<{ syncedCount: number; message: string }>(
    "/admin/users/sync",
    { method: "POST" }
  );

  if (!res.ok || !res.data) {
    return {
      success: false,
      syncedCount: 0,
      message: res.error || "Erreur lors de la synchronisation des comptes.",
    };
  }

  revalidatePath("/admin/users");

  return {
    success: true,
    syncedCount: res.data.syncedCount ?? 0,
    message:
      res.data.message ||
      `${res.data.syncedCount ?? 0} compte(s) synchronisé(s) avec succès.`,
  };
}

/**
 * Server Action : Récupère les opportunités via `GET /opportunities`
 */
export async function getRealOpportunitiesAction(): Promise<
  RealOpportunityRow[]
> {
  const res = await apiRequest<{ data: RealOpportunityRow[] }>(
    "/opportunities",
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

/**
 * Server Action : Récupère les masterclasses via `GET /masterclasses`
 */
export async function getRealMasterclassesAction(): Promise<
  RealMasterclassRow[]
> {
  const res = await apiRequest<{ data: RealMasterclassRow[] }>(
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

/**
 * Server Action : Récupère le flux récent d'activités via `GET /admin/activities`
 */
export async function getRecentAdminActivitiesAction(): Promise<
  RecentAdminActivity[]
> {
  const res = await apiRequest<{
    recentUsers?: Array<{
      id: string;
      nom: string;
      prenom: string;
      email?: string;
      role: string;
      statutCompte?: string;
      createdAt: string;
    }>;
  }>("/admin/activities");

  if (!res.ok || !res.data?.recentUsers?.length) {
    return [];
  }

  return res.data.recentUsers.slice(0, 5).map((u) => {
    const roleLabel =
      u.role === "ADMIN"
        ? "Administrateur"
        : u.role === "MENTOR"
        ? "Mentor"
        : u.role === "EXPERT"
        ? "Expert"
        : u.role === "PARTENAIRE"
        ? "Partenaire"
        : "Bénéficiaire";

    const dateStr = new Date(u.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: `act-${u.id}`,
      type: u.role === "MENTOR" ? "mentor_applied" : "user_registered",
      title: `Inscription : ${u.prenom} ${u.nom}`,
      description: `Compte ${roleLabel}${u.email ? ` (${u.email})` : ""}${
        u.statutCompte ? ` - Statut : ${u.statutCompte}` : ""
      }`,
      timestamp: dateStr,
      userRole: u.role.toLowerCase(),
    };
  });
}
