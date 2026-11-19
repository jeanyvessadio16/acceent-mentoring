"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import type { BeneficiaryDashboardData } from "@/types";

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
    const { data: dbUser, error: userError } = await findDbUserByAuth(
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
      console.error("Utilisateur introuvable dans la table User :", userError?.message);
      // Profil de secours basé sur Supabase Auth en attendant la synchro
      const meta = authUser.user_metadata || {};
      return {
        user: {
          id: authUser.id,
          email: authUser.email || "",
          prenom: meta.first_name || meta.prenom || "Bénéficiaire",
          nom: meta.last_name || meta.nom || "",
          role: meta.role || "BENEFICIAIRE",
          statutCompte: meta.status || "ACTIVE",
          age: meta.age || null,
          sexe: meta.sexe || null,
          milieuResidence: meta.milieu_residence || null,
          situationHandicap: !!meta.sdh || false,
          photoUrl: null,
        },
        hasCompletedDiagnosis: false,
        diagnostic: null,
        activeProgramsCount: 0,
        upcomingSessionsCount: 0,
        completedSessionsCount: 0,
        averageProgress: 0,
        activeProgram: null,
        upcomingSessions: [],
        recommendedMentors: [],
      };
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
      .select(`
        id, titre, description, status, progression, startDate, endDate,
        mentor:User!mentorId (id, nom, prenom, email, MentorProfile (fonction, organisation)),
        goals:MentorshipGoal (id),
        tasks:MentorshipTask (id)
      `)
      .eq("menteeId", dbUser.id)
      .eq("status", "ACTIVE");

    const activeProgramData = programs && programs.length > 0 ? programs[0] : null;

    let activeProgram = null;
    if (activeProgramData) {
      const mentorObj: any = activeProgramData.mentor;
      const mentorProfile = Array.isArray(mentorObj?.MentorProfile)
        ? mentorObj?.MentorProfile[0]
        : mentorObj?.MentorProfile;

      activeProgram = {
        id: activeProgramData.id,
        titre: activeProgramData.titre,
        progression: Math.round(activeProgramData.progression || 0),
        mentorName: mentorObj ? `${mentorObj.prenom} ${mentorObj.nom}`.trim() : "Mentor ACCEENT",
        mentorTitle: mentorProfile?.fonction || undefined,
        mentorEmail: mentorObj?.email || undefined,
        goalsCount: activeProgramData.goals?.length || 0,
        tasksCount: activeProgramData.tasks?.length || 0,
      };
    }

    // 3. Récupérer les sessions de mentoring réelles
    const { data: sessions } = await adminDb
      .from("MentorshipSession")
      .select(`
        id, titre, dateDebut, dateFin, meetingUrl, status,
        mentor:User!mentorId (nom, prenom)
      `)
      .eq("menteeId", dbUser.id)
      .order("dateDebut", { ascending: true });

    const allSessions = sessions || [];
    const upcomingSessions = allSessions
      .filter((s: any) => s.status === "SCHEDULED" || new Date(s.dateDebut) >= new Date())
      .map((s: any) => ({
        id: s.id,
        titre: s.titre,
        mentorName: s.mentor ? `${s.mentor.prenom} ${s.mentor.nom}`.trim() : "Mentor",
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        meetingUrl: s.meetingUrl || null,
        status: s.status,
      }));

    const completedSessionsCount = allSessions.filter(
      (s: any) => s.status === "COMPLETED"
    ).length;

    // 4. Récupérer les recommandations réelles issues du moteur de matching (F05)
    let recommendedMentors: any[] = [];
    const { data: matchings } = await adminDb
      .from("MatchingResult")
      .select(`
        id, scoreTotal, justification,
        mentor:MentorProfile!mentorId (
          id, userId, fonction, organisation, anneesExperience, expertises, isAvailable,
          user:User!userId (id, nom, prenom, email)
        )
      `)
      .eq("menteeId", dbUser.id)
      .order("scoreTotal", { ascending: false })
      .limit(4);

    if (matchings && matchings.length > 0) {
      recommendedMentors = matchings.map((m: any) => {
        const mp = m.mentor;
        return {
          id: mp?.id || m.id,
          mentorId: mp?.userId || "",
          nom: mp?.user?.nom || "",
          prenom: mp?.user?.prenom || "",
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
        .select(`
          id, userId, fonction, organisation, anneesExperience, expertises, isAvailable,
          user:User!userId (id, nom, prenom, email)
        `)
        .eq("statutValidation", "ACTIVE")
        .eq("isAvailable", true)
        .limit(4);

      recommendedMentors = (mentors || []).map((m: any) => ({
        id: m.id,
        mentorId: m.userId,
        nom: m.user?.nom || "",
        prenom: m.user?.prenom || "",
        fonction: m.fonction,
        organisation: m.organisation,
        expertises: m.expertises || [],
        anneesExperience: m.anneesExperience || 0,
        isAvailable: m.isAvailable,
      }));
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
      activeProgramsCount: programs?.length || 0,
      upcomingSessionsCount: upcomingSessions.length,
      completedSessionsCount,
      averageProgress: activeProgram ? activeProgram.progression : 0,
      activeProgram,
      upcomingSessions,
      recommendedMentors,
    };
  } catch (err: any) {
    if (
      err?.digest === "HANGING_PROMISE_REJECTION" ||
      (typeof err?.digest === "string" && err.digest.startsWith("NEXT_"))
    ) {
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
export async function getActiveMentorsCatalogAction(): Promise<CatalogMentorItem[]> {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("MentorProfile")
      .select(`
        id, userId, fonction, organisation, anneesExperience,
        expertises, secteurs, langues, typesMentoring, disponibilites,
        biographie, photoUrl, isAvailable,
        user:User!userId (id, nom, prenom, pays)
      `)
      .eq("statutValidation", "ACTIVE")
      .eq("isAvailable", true)
      .order("anneesExperience", { ascending: false });

    if (error || !data) {
      if (error) {
        console.error("Erreur getActiveMentorsCatalogAction :", error.message);
      }
      return [];
    }

    return data.map((m: any) => {
      const userObj = Array.isArray(m.user) ? m.user[0] : m.user;
      return {
        id: m.id,
        userId: m.userId,
        nom: userObj?.nom || "",
        prenom: userObj?.prenom || "",
        pays: userObj?.pays || "Sénégal",
        fonction: m.fonction || "",
        organisation: m.organisation || "",
        anneesExperience: m.anneesExperience || 0,
        expertises: m.expertises || [],
        secteurs: m.secteurs || [],
        langues: m.langues || [],
        typesMentoring: m.typesMentoring || "INDIVIDUEL",
        disponibilites: m.disponibilites || null,
        biographie: m.biographie || "",
        photoUrl: m.photoUrl || null,
        isAvailable: Boolean(m.isAvailable),
      };
    });
  } catch (err) {
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

    let mentorRecord: any = byProfileId.data;

    if (!mentorRecord) {
      const byUserId = await adminDb
        .from("MentorProfile")
        .select(selectQuery)
        .eq("userId", id)
        .eq("statutValidation", "ACTIVE")
        .maybeSingle();
      mentorRecord = byUserId.data;
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
      pays: userObj?.pays || "Sénégal",
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
      photoUrl: mentorRecord.photoUrl || null,
      linkedinUrl: mentorRecord.linkedinUrl || null,
      statutValidation: mentorRecord.statutValidation || "ACTIVE",
      isAvailable: Boolean(mentorRecord.isAvailable),
    };
  } catch (err) {
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
        console.error("Erreur getBeneficiaryOpportunitiesAction :", error.message);
      }
      return [];
    }

    return data as BeneficiaryOpportunityItem[];
  } catch (err) {
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
        console.error("Erreur getBeneficiaryMasterclassesAction :", error.message);
      }
      return [];
    }

    return data as BeneficiaryMasterclassItem[];
  } catch (err) {
    console.error("Erreur inattendue getBeneficiaryMasterclassesAction :", err);
    return [];
  }
}
