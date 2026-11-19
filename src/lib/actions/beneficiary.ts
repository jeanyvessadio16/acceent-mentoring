"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import { isNextInternalError } from "@/lib/utils/next-errors";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import type { BeneficiaryDashboardData } from "@/types";

interface DbDiagnosticSummary {
  id: string;
  domaine: string;
  objectifPrincipal: string;
  isCompleted: boolean;
}

interface DbUserProfileSummary {
  photoUrl: string | null;
  ville: string | null;
  niveauEtude: string | null;
  secteurActivite: string | null;
  competences: string[] | null;
  objectifs: string[] | null;
}

interface DbBeneficiaryUserRow {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  pays: string;
  role: string;
  statutCompte: string;
  age: number | null;
  sexe: string | null;
  milieuResidence: string | null;
  situationHandicap: boolean;
  createdAt: string;
  UserProfile: DbUserProfileSummary | DbUserProfileSummary[] | null;
  Diagnostic: DbDiagnosticSummary | DbDiagnosticSummary[] | null;
}

interface DbProgramRow {
  id: string;
  titre: string;
  progression: number | null;
  mentor:
  | {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    MentorProfile:
    | { fonction: string | null; organisation: string | null }
    | Array<{ fonction: string | null; organisation: string | null }>
    | null;
  }
  | Array<{
    id: string;
    nom: string;
    prenom: string;
    email: string;
    MentorProfile:
    | { fonction: string | null; organisation: string | null }
    | Array<{ fonction: string | null; organisation: string | null }>
    | null;
  }>
  | null;
  goals: Array<{ id: string }> | null;
  tasks: Array<{ id: string }> | null;
}

interface DbSessionRow {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  meetingUrl: string | null;
  status: string;
  mentor:
  | { nom: string; prenom: string }
  | Array<{ nom: string; prenom: string }>
  | null;
}

interface DbMentorRow {
  id: string;
  userId: string;
  fonction: string | null;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  secteurs?: string[] | null;
  langues?: string[] | null;
  publicsAccompagnes?: string[] | null;
  typesMentoring?: string | null;
  disponibilites?: string | null;
  biographie?: string | null;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  statutValidation?: string | null;
  isAvailable: boolean;
  user:
  | { id: string; nom: string; prenom: string; email?: string; pays?: string }
  | Array<{
    id: string;
    nom: string;
    prenom: string;
    email?: string;
    pays?: string;
  }>
  | null;
}

interface DbMatchingRow {
  id: string;
  scoreTotal: number;
  justification: string;
  mentor: DbMentorRow | DbMentorRow[] | null;
}

async function hasActiveAccountAccess(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();
    if (error || !authUser) {
      return false;
    }

    const adminDb = createAdminClient();
    const { data: dbUser } = await findDbUserByAuth<{
      id: string;
      statutCompte: string;
    }>(adminDb, authUser, "id, statutCompte");

    if (!dbUser) {
      return false;
    }

    return (
      dbUser.statutCompte !== "SUSPENDED" && dbUser.statutCompte !== "REJECTED"
    );
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    return false;
  }
}

/**
 * Server Action : Récupère les données réelles du tableau de bord bénéficiaire connecté
 * STRICTEMENT AUCUNE FAUSSE DONNÉE.
 */
export async function getBeneficiaryDashboardAction(): Promise<BeneficiaryDashboardData | null> {
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

    // 1. Récupérer l'utilisateur dans PostgreSQL
    const { data: dbUser, error: userError } =
      await findDbUserByAuth<DbBeneficiaryUserRow>(
        adminDb,
        authUser,
        `
        id, email, nom, prenom, telephone, pays, role, statutCompte,
        age, sexe, milieuResidence, situationHandicap, createdAt,
        UserProfile (photoUrl, ville, niveauEtude, secteurActivite, competences, objectifs),
        Diagnostic (id, domaine, objectifPrincipal, isCompleted)
      `
      );

    if (userError || !dbUser) {
      if (userError) {
        console.error(
          "Utilisateur introuvable dans la table User :",
          userError.message
        );
      }
      return null;
    }

    // Contrôle strict du rôle et du statut du compte
    if (
      dbUser.statutCompte === "SUSPENDED" ||
      dbUser.statutCompte === "REJECTED" ||
      (dbUser.role !== "BENEFICIAIRE" && dbUser.role !== "ADMIN")
    ) {
      return null;
    }

    // Diagnostic
    const diagnostic = Array.isArray(dbUser.Diagnostic)
      ? dbUser.Diagnostic[0]
      : dbUser.Diagnostic;
    const hasCompletedDiagnosis = !!diagnostic?.isCompleted;

    const userProfile = Array.isArray(dbUser.UserProfile)
      ? dbUser.UserProfile[0]
      : dbUser.UserProfile;

    // 2. Récupérer les programmes de mentoring réels pour ce bénéficiaire
    const { data: programs } = await adminDb
      .from("MentorshipProgram")
      .select(
        `
        id, titre, description, status, progression, startDate, endDate,
        mentor:User!mentorId (id, nom, prenom, email, MentorProfile (fonction, organisation)),
        goals:MentorshipGoal (id),
        tasks:MentorshipTask (id)
      `
      )
      .eq("menteeId", dbUser.id)
      .eq("status", "ACTIVE");

    const typedPrograms = (programs || []) as unknown as DbProgramRow[];
    const activeProgramData =
      typedPrograms.length > 0 ? typedPrograms[0] : null;

    let activeProgram: BeneficiaryDashboardData["activeProgram"] = null;
    if (activeProgramData) {
      const mentorObj = Array.isArray(activeProgramData.mentor)
        ? activeProgramData.mentor[0]
        : activeProgramData.mentor;
      const mentorProfile = Array.isArray(mentorObj?.MentorProfile)
        ? mentorObj?.MentorProfile[0]
        : mentorObj?.MentorProfile;

      activeProgram = {
        id: activeProgramData.id,
        titre: activeProgramData.titre,
        progression: Math.round(activeProgramData.progression || 0),
        mentorName: mentorObj
          ? `${mentorObj.prenom} ${mentorObj.nom}`.trim()
          : "Mentor ACCEENT",
        mentorTitle: mentorProfile?.fonction || undefined,
        mentorEmail: mentorObj?.email || undefined,
        goalsCount: activeProgramData.goals?.length || 0,
        tasksCount: activeProgramData.tasks?.length || 0,
      };
    }

    // 3. Récupérer les sessions de mentoring réelles
    const { data: sessions } = await adminDb
      .from("MentorshipSession")
      .select(
        `
        id, titre, dateDebut, dateFin, meetingUrl, status,
        mentor:User!mentorId (nom, prenom)
      `
      )
      .eq("menteeId", dbUser.id)
      .order("dateDebut", { ascending: true });

    const allSessions = (sessions || []) as unknown as DbSessionRow[];
    const upcomingSessions = allSessions
      .filter(
        (s) =>
          s.status === "SCHEDULED" || new Date(s.dateDebut) >= new Date()
      )
      .map((s) => {
        const mentorUser = Array.isArray(s.mentor) ? s.mentor[0] : s.mentor;
        return {
          id: s.id,
          titre: s.titre,
          mentorName: mentorUser
            ? `${mentorUser.prenom} ${mentorUser.nom}`.trim()
            : "Mentor",
          dateDebut: s.dateDebut,
          dateFin: s.dateFin,
          meetingUrl: sanitizeExternalUrl(s.meetingUrl),
          status: s.status,
        };
      });

    const completedSessionsCount = allSessions.filter(
      (s) => s.status === "COMPLETED"
    ).length;

    // 4. Récupérer les recommandations réelles issues du moteur de matching (F05)
    let recommendedMentors: BeneficiaryDashboardData["recommendedMentors"] = [];
    const { data: matchings } = await adminDb
      .from("MatchingResult")
      .select(
        `
        id, scoreTotal, justification,
        mentor:MentorProfile!mentorId (
          id, userId, fonction, organisation, anneesExperience, expertises, isAvailable,
          user:User!userId (id, nom, prenom, email)
        )
      `
      )
      .eq("menteeId", dbUser.id)
      .order("scoreTotal", { ascending: false })
      .limit(4);

    const typedMatchings = (matchings || []) as unknown as DbMatchingRow[];

    if (typedMatchings.length > 0) {
      recommendedMentors = typedMatchings.map((m) => {
        const mp = Array.isArray(m.mentor) ? m.mentor[0] : m.mentor;
        const mentorUser = Array.isArray(mp?.user) ? mp?.user[0] : mp?.user;
        return {
          id: mp?.id || m.id,
          mentorId: mp?.userId || "",
          nom: mentorUser?.nom || "",
          prenom: mentorUser?.prenom || "",
          fonction: mp?.fonction || "",
          organisation: mp?.organisation || "",
          expertises: mp?.expertises || [],
          anneesExperience: mp?.anneesExperience || 0,
          isAvailable: mp?.isAvailable ?? true,
          scoreTotal: m.scoreTotal,
          justification: m.justification,
        };
      });
    } else {
      // Fallback : Récupérer les mentors validés et disponibles en base de données
      const { data: mentors } = await adminDb
        .from("MentorProfile")
        .select(
          `
          id, userId, fonction, organisation, anneesExperience, expertises, isAvailable,
          user:User!userId (id, nom, prenom, email)
        `
        )
        .eq("statutValidation", "ACTIVE")
        .eq("isAvailable", true)
        .limit(4);

      const typedMentors = (mentors || []) as unknown as DbMentorRow[];
      recommendedMentors = typedMentors.map((m) => {
        const mentorUser = Array.isArray(m.user) ? m.user[0] : m.user;
        return {
          id: m.id,
          mentorId: m.userId,
          nom: mentorUser?.nom || "",
          prenom: mentorUser?.prenom || "",
          fonction: m.fonction || "",
          organisation: m.organisation || "",
          expertises: m.expertises || [],
          anneesExperience: m.anneesExperience || 0,
          isAvailable: m.isAvailable,
        };
      });
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        prenom: dbUser.prenom,
        nom: dbUser.nom,
        role: dbUser.role,
        statutCompte: dbUser.statutCompte,
        age: dbUser.age,
        sexe: dbUser.sexe,
        milieuResidence: dbUser.milieuResidence,
        situationHandicap: dbUser.situationHandicap,
        photoUrl: userProfile?.photoUrl || null,
      },
      hasCompletedDiagnosis,
      diagnostic: diagnostic
        ? {
          id: diagnostic.id,
          domaine: diagnostic.domaine,
          objectifPrincipal: diagnostic.objectifPrincipal,
          isCompleted: diagnostic.isCompleted,
        }
        : null,
      activeProgramsCount: typedPrograms.length,
      upcomingSessionsCount: upcomingSessions.length,
      completedSessionsCount,
      averageProgress: activeProgram ? activeProgram.progression : 0,
      activeProgram,
      upcomingSessions,
      recommendedMentors,
    };
  } catch (err: unknown) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur dans getBeneficiaryDashboardAction :", err);
    return null;
  }
}

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

/**
 * Server Action : Récupère le catalogue réel des mentors certifiés actifs
 */
export async function getActiveMentorsCatalogAction(): Promise<
  CatalogMentorItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("MentorProfile")
      .select(
        `
        id, userId, fonction, organisation, anneesExperience,
        expertises, secteurs, langues, typesMentoring, disponibilites,
        biographie, photoUrl, isAvailable,
        user:User!userId (id, nom, prenom, pays)
      `
      )
      .eq("statutValidation", "ACTIVE")
      .eq("isAvailable", true)
      .order("anneesExperience", { ascending: false });

    if (error || !data) {
      if (error) {
        console.error("Erreur getActiveMentorsCatalogAction :", error.message);
      }
      return [];
    }

    const rows = data as unknown as DbMentorRow[];
    return rows.map((m) => {
      const userObj = Array.isArray(m.user) ? m.user[0] : m.user;
      return {
        id: m.id,
        userId: m.userId,
        nom: userObj?.nom || "",
        prenom: userObj?.prenom || "",
        pays: userObj?.pays || "",
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
      };
    });
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue getActiveMentorsCatalogAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère le détail réel d'un mentor actif par ID de profil ou userId
 */
export async function getMentorDetailByIdAction(
  id: string
): Promise<MentorDetailItem | null> {
  if (!(await hasActiveAccountAccess())) {
    return null;
  }

  try {
    const adminDb = createAdminClient();
    const selectQuery = `
      id, userId, fonction, organisation, anneesExperience,
      expertises, secteurs, langues, publicsAccompagnes,
      typesMentoring, disponibilites, biographie, photoUrl,
      linkedinUrl, statutValidation, isAvailable,
      user:User!userId (id, nom, prenom, pays)
    `;

    const byProfileId = await adminDb
      .from("MentorProfile")
      .select(selectQuery)
      .eq("id", id)
      .eq("statutValidation", "ACTIVE")
      .maybeSingle();

    let mentorRecord = byProfileId.data as DbMentorRow | null;

    if (!mentorRecord) {
      const byUserId = await adminDb
        .from("MentorProfile")
        .select(selectQuery)
        .eq("userId", id)
        .eq("statutValidation", "ACTIVE")
        .maybeSingle();
      mentorRecord = byUserId.data as DbMentorRow | null;
    }

    if (!mentorRecord) {
      return null;
    }

    const userObj = Array.isArray(mentorRecord.user)
      ? mentorRecord.user[0]
      : mentorRecord.user;

    return {
      id: mentorRecord.id,
      userId: mentorRecord.userId,
      nom: userObj?.nom || "",
      prenom: userObj?.prenom || "",
      pays: userObj?.pays || "",
      fonction: mentorRecord.fonction || "",
      organisation: mentorRecord.organisation || "",
      anneesExperience: mentorRecord.anneesExperience || 0,
      expertises: mentorRecord.expertises || [],
      secteurs: mentorRecord.secteurs || [],
      langues: mentorRecord.langues || [],
      publicsAccompagnes: mentorRecord.publicsAccompagnes || [],
      typesMentoring: mentorRecord.typesMentoring || "INDIVIDUEL",
      disponibilites: mentorRecord.disponibilites || null,
      biographie: mentorRecord.biographie || "",
      photoUrl: sanitizeExternalUrl(mentorRecord.photoUrl),
      linkedinUrl: sanitizeExternalUrl(mentorRecord.linkedinUrl),
      statutValidation: mentorRecord.statutValidation || "ACTIVE",
      isAvailable: Boolean(mentorRecord.isAvailable),
    };
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue getMentorDetailByIdAction :", err);
    return null;
  }
}

/**
 * Server Action : Récupère les opportunités actives réelles pour l'espace bénéficiaire
 */
export async function getBeneficiaryOpportunitiesAction(): Promise<
  BeneficiaryOpportunityItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("Opportunity")
      .select(
        "id, titre, organisation, categorie, description, localisation, typeContrat, lienCandidature, dateExpiration, status"
      )
      .eq("status", "ACTIVE")
      .order("createdAt", { ascending: false });

    if (error || !data) {
      if (error) {
        console.error(
          "Erreur getBeneficiaryOpportunitiesAction :",
          error.message
        );
      }
      return [];
    }

    return data as BeneficiaryOpportunityItem[];
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue getBeneficiaryOpportunitiesAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère les masterclasses réelles pour l'espace bénéficiaire
 */
export async function getBeneficiaryMasterclassesAction(): Promise<
  BeneficiaryMasterclassItem[]
> {
  if (!(await hasActiveAccountAccess())) {
    return [];
  }

  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("Masterclass")
      .select(
        "id, titre, intervenant, description, categorie, dateSession, duree, lienLive, lienReplay, statut, maxParticipants"
      )
      .order("dateSession", { ascending: true });

    if (error || !data) {
      if (error) {
        console.error(
          "Erreur getBeneficiaryMasterclassesAction :",
          error.message
        );
      }
      return [];
    }

    return data as BeneficiaryMasterclassItem[];
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue getBeneficiaryMasterclassesAction :", err);
    return [];
  }
}
