"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminStatsAction } from "@/lib/actions/admin";
import type { AdminDashboardStats } from "@/types";

export interface WorkspaceUserSummary {
  id: string;
  dbUserId: string | null;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  statutCompte: string;
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

async function getAuthenticatedDbUser(): Promise<WorkspaceUserSummary | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    const adminDb = createAdminClient();
    const { data: dbUser } = await adminDb
      .from("User")
      .select("id, email, nom, prenom, role, statutCompte")
      .or(`supabaseUid.eq.${authUser.id},email.eq.${authUser.email}`)
      .maybeSingle();

    if (dbUser) {
      return {
        id: dbUser.id,
        dbUserId: dbUser.id,
        email: dbUser.email,
        prenom: dbUser.prenom || "",
        nom: dbUser.nom || "",
        role: dbUser.role || "BENEFICIAIRE",
        statutCompte: dbUser.statutCompte || "ACTIVE",
      };
    }

    const meta = authUser.user_metadata || {};
    return {
      id: authUser.id,
      dbUserId: null,
      email: authUser.email || "",
      prenom: meta.first_name || meta.prenom || meta.full_name || "Utilisateur",
      nom: meta.last_name || meta.nom || "",
      role: (meta.role || meta.account_type || "BENEFICIAIRE").toUpperCase(),
      statutCompte: meta.status || meta.statutCompte || "PENDING",
    };
  } catch (err: any) {
    if (err?.digest === "HANGING_PROMISE_REJECTION") {
      return null;
    }
    if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_")) {
      throw err;
    }
    console.error("Erreur getAuthenticatedDbUser :", err);
    return null;
  }
}

/**
 * Server Action : Récupère les données réelles de l'espace Mentor
 */
export async function getMentorWorkspaceDataAction(): Promise<MentorWorkspaceData | null> {
  const user = await getAuthenticatedDbUser();
  if (!user) {
    return null;
  }

  if (!user.dbUserId) {
    return {
      user,
      mentorProfile: null,
      requests: [],
      pendingRequestsCount: 0,
      programs: [],
      activeProgramsCount: 0,
      sessions: [],
      upcomingSessions: [],
      completedSessionsCount: 0,
      availabilitySlots: [],
    };
  }

  try {
    const adminDb = createAdminClient();
    const dbUserId = user.dbUserId;

    const [
      profileRes,
      requestsRes,
      programsRes,
      sessionsRes,
      slotsRes,
    ] = await Promise.all([
      adminDb
        .from("MentorProfile")
        .select(
          "id, fonction, organisation, anneesExperience, expertises, statutValidation, isAvailable, typesMentoring"
        )
        .eq("userId", dbUserId)
        .maybeSingle(),
      adminDb
        .from("MentorshipRequest")
        .select(`
          id, objectif, problematique, duree, frequence, format, message, status, createdAt,
          mentee:User!menteeId (id, nom, prenom, email)
        `)
        .eq("mentorId", dbUserId)
        .order("createdAt", { ascending: false }),
      adminDb
        .from("MentorshipProgram")
        .select(`
          id, titre, description, status, progression, startDate,
          mentee:User!menteeId (id, nom, prenom, email),
          goals:MentorshipGoal (id),
          tasks:MentorshipTask (id)
        `)
        .eq("mentorId", dbUserId)
        .order("createdAt", { ascending: false }),
      adminDb
        .from("MentorshipSession")
        .select(`
          id, titre, dateDebut, dateFin, meetingUrl, status,
          mentee:User!menteeId (id, nom, prenom)
        `)
        .eq("mentorId", dbUserId)
        .order("dateDebut", { ascending: true }),
      adminDb
        .from("AvailabilitySlot")
        .select("id, dayOfWeek, startTime, endTime, specificDate, isRecurring, isActive")
        .eq("mentorId", dbUserId)
        .eq("isActive", true),
    ]);

    const requests: MentorRequestItem[] = (requestsRes.data || []).map((r: any) => {
      const mentee = Array.isArray(r.mentee) ? r.mentee[0] : r.mentee;
      return {
        id: r.id,
        objectif: r.objectif || "",
        problematique: r.problematique || "",
        duree: r.duree || "",
        frequence: r.frequence || "",
        format: r.format || "",
        message: r.message || "",
        status: r.status || "PENDING",
        createdAt: r.createdAt,
        menteeName: mentee ? `${mentee.prenom} ${mentee.nom}`.trim() : "Bénéficiaire",
        menteeEmail: mentee?.email || "",
      };
    });

    const pendingRequestsCount = requests.filter((r) => r.status === "PENDING").length;

    const programs: MentorProgramItem[] = (programsRes.data || []).map((p: any) => {
      const mentee = Array.isArray(p.mentee) ? p.mentee[0] : p.mentee;
      return {
        id: p.id,
        titre: p.titre || "",
        description: p.description || null,
        status: p.status || "ACTIVE",
        progression: Math.round(p.progression || 0),
        startDate: p.startDate,
        menteeName: mentee ? `${mentee.prenom} ${mentee.nom}`.trim() : "Bénéficiaire",
        menteeEmail: mentee?.email || "",
        goalsCount: Array.isArray(p.goals) ? p.goals.length : 0,
        tasksCount: Array.isArray(p.tasks) ? p.tasks.length : 0,
      };
    });

    const activeProgramsCount = programs.filter((p) => p.status === "ACTIVE").length;

    const sessions: WorkspaceSessionItem[] = (sessionsRes.data || []).map((s: any) => {
      const mentee = Array.isArray(s.mentee) ? s.mentee[0] : s.mentee;
      return {
        id: s.id,
        titre: s.titre || "",
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        meetingUrl: s.meetingUrl || null,
        status: s.status || "SCHEDULED",
        menteeName: mentee ? `${mentee.prenom} ${mentee.nom}`.trim() : "Bénéficiaire",
      };
    });

    const now = new Date();
    const upcomingSessions = sessions.filter(
      (s) => s.status === "SCHEDULED" && new Date(s.dateDebut) >= now
    );
    const completedSessionsCount = sessions.filter(
      (s) => s.status === "COMPLETED"
    ).length;

    return {
      user,
      mentorProfile: profileRes.data
        ? {
            id: profileRes.data.id,
            fonction: profileRes.data.fonction || "",
            organisation: profileRes.data.organisation || "",
            anneesExperience: profileRes.data.anneesExperience || 0,
            expertises: profileRes.data.expertises || [],
            statutValidation: profileRes.data.statutValidation || "PENDING",
            isAvailable: Boolean(profileRes.data.isAvailable),
            typesMentoring: profileRes.data.typesMentoring || "INDIVIDUEL",
          }
        : null,
      requests,
      pendingRequestsCount,
      programs,
      activeProgramsCount,
      sessions,
      upcomingSessions,
      completedSessionsCount,
      availabilitySlots: (slotsRes.data || []) as MentorAvailabilitySlotItem[],
    };
  } catch (err) {
    console.error("Erreur getMentorWorkspaceDataAction :", err);
    return {
      user,
      mentorProfile: null,
      requests: [],
      pendingRequestsCount: 0,
      programs: [],
      activeProgramsCount: 0,
      sessions: [],
      upcomingSessions: [],
      completedSessionsCount: 0,
      availabilitySlots: [],
    };
  }
}

/**
 * Server Action : Récupère les données réelles de l'espace Expert
 */
export async function getExpertWorkspaceDataAction(): Promise<ExpertWorkspaceData | null> {
  const user = await getAuthenticatedDbUser();
  if (!user) {
    return null;
  }

  try {
    const adminDb = createAdminClient();

    const [profileRes, masterclassesRes, sessionsRes] = await Promise.all([
      user.dbUserId
        ? adminDb
            .from("MentorProfile")
            .select("id, fonction, organisation, statutValidation")
            .eq("userId", user.dbUserId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      adminDb
        .from("Masterclass")
        .select(
          "id, titre, intervenant, description, categorie, dateSession, duree, lienLive, lienReplay, statut, maxParticipants"
        )
        .order("dateSession", { ascending: true }),
      user.dbUserId
        ? adminDb
            .from("MentorshipSession")
            .select(`
              id, titre, dateDebut, dateFin, meetingUrl, status,
              mentee:User!menteeId (id, nom, prenom)
            `)
            .eq("mentorId", user.dbUserId)
            .order("dateDebut", { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

    const sessions: WorkspaceSessionItem[] = (sessionsRes.data || []).map((s: any) => {
      const mentee = Array.isArray(s.mentee) ? s.mentee[0] : s.mentee;
      return {
        id: s.id,
        titre: s.titre || "",
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        meetingUrl: s.meetingUrl || null,
        status: s.status || "SCHEDULED",
        menteeName: mentee ? `${mentee.prenom} ${mentee.nom}`.trim() : "Participant",
      };
    });

    const now = new Date();
    const upcomingSessionsCount = sessions.filter(
      (s) => s.status === "SCHEDULED" && new Date(s.dateDebut) >= now
    ).length;
    const completedSessionsCount = sessions.filter(
      (s) => s.status === "COMPLETED"
    ).length;

    return {
      user,
      mentorProfile: profileRes.data
        ? {
            id: profileRes.data.id,
            fonction: profileRes.data.fonction || "",
            organisation: profileRes.data.organisation || "",
            statutValidation: profileRes.data.statutValidation || "PENDING",
          }
        : null,
      masterclasses: (masterclassesRes.data || []) as ExpertMasterclassItem[],
      sessions,
      upcomingSessionsCount,
      completedSessionsCount,
    };
  } catch (err) {
    console.error("Erreur getExpertWorkspaceDataAction :", err);
    return {
      user,
      mentorProfile: null,
      masterclasses: [],
      sessions: [],
      upcomingSessionsCount: 0,
      completedSessionsCount: 0,
    };
  }
}

/**
 * Server Action : Récupère les données réelles de l'espace Partenaire
 */
export async function getPartnerWorkspaceDataAction(): Promise<PartnerWorkspaceData | null> {
  const user = await getAuthenticatedDbUser();
  if (!user) {
    return null;
  }

  try {
    const adminDb = createAdminClient();
    const [oppsRes, stats] = await Promise.all([
      adminDb
        .from("Opportunity")
        .select(
          "id, titre, organisation, categorie, description, localisation, typeContrat, lienCandidature, dateExpiration, status, createdAt"
        )
        .order("createdAt", { ascending: false }),
      getAdminStatsAction(),
    ]);

    const opportunities = (oppsRes.data || []) as PartnerOpportunityItem[];
    const activeOpportunitiesCount = opportunities.filter(
      (o) => o.status === "ACTIVE"
    ).length;

    return {
      user,
      opportunities,
      activeOpportunitiesCount,
      stats,
    };
  } catch (err) {
    console.error("Erreur getPartnerWorkspaceDataAction :", err);
    const stats = await getAdminStatsAction();
    return {
      user,
      opportunities: [],
      activeOpportunitiesCount: 0,
      stats,
    };
  }
}
