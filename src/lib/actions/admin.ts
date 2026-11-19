"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import {
  EMPTY_PLATFORM_STATS,
  computeAggregatedPlatformStats,
} from "@/lib/supabase/platform-stats";
import { isNextInternalError } from "@/lib/utils/next-errors";
import { CV_STORAGE_BUCKET } from "@/lib/utils/cv-upload";
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

interface PendingMentorProfileRow {
  id: string;
  fonction: string | null;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  secteurs: string[] | null;
  biographie: string | null;
  cvUrl: string | null;
  linkedinUrl: string | null;
  references: string | null;
  typesMentoring: string | null;
  disponibilites: string | null;
  statutValidation: string | null;
}

interface PendingUserRow {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: string;
  createdAt: string | null;
  MentorProfile: PendingMentorProfileRow | PendingMentorProfileRow[] | null;
}

/**
 * Vérifie côté serveur que l'appelant est authentifié et possède le rôle ADMIN actif.
 */
async function requireAdmin(): Promise<CurrentAdminUser | null> {
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
    const { data: dbUser } = await findDbUserByAuth<{
      id: string;
      email: string;
      nom: string | null;
      prenom: string | null;
      role: string;
      statutCompte: string;
      UserProfile: { photoUrl: string | null } | Array<{ photoUrl: string | null }> | null;
    }>(adminDb, authUser, "id, email, nom, prenom, role, statutCompte, UserProfile(photoUrl)");

    if (
      !dbUser ||
      dbUser.role !== "ADMIN" ||
      dbUser.statutCompte === "SUSPENDED" ||
      dbUser.statutCompte === "REJECTED"
    ) {
      return null;
    }

    const userProfile = Array.isArray(dbUser.UserProfile)
      ? dbUser.UserProfile[0]
      : dbUser.UserProfile;

    return {
      id: dbUser.id,
      email: dbUser.email,
      nom: dbUser.nom || "",
      prenom: dbUser.prenom || "",
      role: dbUser.role,
      photoUrl: userProfile?.photoUrl || null,
    };
  } catch (error) {
    if (isNextInternalError(error)) {
      throw error;
    }
    console.error("Erreur requireAdmin :", error);
    return null;
  }
}

/**
 * Server Action : Récupère les données réelles de l'administrateur connecté
 */
export async function getCurrentAdminUserAction(): Promise<CurrentAdminUser | null> {
  return requireAdmin();
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

/**
 * Server Action : Récupère les métriques réelles calculées depuis la base de données PostgreSQL
 * STRICTEMENT AUCUNE FAUSSE DONNÉE.
 */
export async function getAdminStatsAction(): Promise<AdminDashboardStats> {
  const admin = await requireAdmin();
  if (!admin) {
    return EMPTY_PLATFORM_STATS;
  }

  return computeAggregatedPlatformStats();
}

/**
 * Server Action : Récupère les profils réels en attente de validation administrative
 * et génère des URLs signées temporaires pour les CV stockés dans le bucket privé.
 */
export async function getPendingValidationsAction(): Promise<PendingValidationItem[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const supabase = createAdminClient();

  try {
    const { data: pendingUsers, error } = await supabase
      .from("User")
      .select(
        `id, email, nom, prenom, role, createdAt,
         MentorProfile (id, fonction, organisation, anneesExperience, expertises, secteurs, biographie, cvUrl, linkedinUrl, references, typesMentoring, disponibilites, statutValidation)`
      )
      .in("role", ["MENTOR", "EXPERT"])
      .eq("statutCompte", "PENDING")
      .order("createdAt", { ascending: false });

    if (error || !pendingUsers) {
      console.error("Erreur getPendingValidationsAction :", error?.message);
      return [];
    }

    const rows = pendingUsers as PendingUserRow[];

    return Promise.all(
      rows.map(async (u) => {
        const profile = Array.isArray(u.MentorProfile)
          ? u.MentorProfile[0]
          : u.MentorProfile;

        const dateStr = u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date non renseignée";

        let signedCvUrl: string | null = null;
        if (profile?.cvUrl) {
          if (
            profile.cvUrl.startsWith("http://") ||
            profile.cvUrl.startsWith("https://")
          ) {
            signedCvUrl = sanitizeExternalUrl(profile.cvUrl);
          } else {
            const { data: signedData } = await supabase.storage
              .from(CV_STORAGE_BUCKET)
              .createSignedUrl(profile.cvUrl, 3600);
            signedCvUrl = sanitizeExternalUrl(signedData?.signedUrl);
          }
        }

        return {
          id: u.id,
          userId: u.id,
          firstName: u.prenom || "",
          lastName: u.nom || "",
          email: u.email,
          role: (u.role?.toLowerCase() === "expert" ? "expert" : "mentor") as
            | "mentor"
            | "expert",
          title: profile?.fonction || "Candidat Mentor / Expert",
          organization: profile?.organisation || undefined,
          yearsOfExperience: profile?.anneesExperience || 0,
          expertises: profile?.expertises || [],
          sectors: profile?.secteurs || [],
          bio: profile?.biographie || undefined,
          cvUrl: signedCvUrl,
          linkedinUrl: sanitizeExternalUrl(profile?.linkedinUrl),
          mentoringFormat: profile?.typesMentoring || undefined,
          availability: profile?.disponibilites || null,
          references: profile?.references || null,
          submittedAt: dateStr,
          status: "pending" as const,
        };
      })
    );
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue dans getPendingValidationsAction :", err);
    return [];
  }
}

/**
 * Server Action : Valide, réactive ou suspend un utilisateur réel dans la base de données
 */
export async function updateUserStatusAction(
  userId: string,
  newStatus: "approved" | "rejected" | "suspended" | "active"
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdmin();
  if (!admin) {
    return {
      success: false,
      message: "Accès refusé : droits administrateur requis.",
    };
  }

  const supabase = createAdminClient();
  const dbStatus =
    newStatus === "approved" || newStatus === "active"
      ? "ACTIVE"
      : newStatus === "rejected"
      ? "REJECTED"
      : "SUSPENDED";
  const now = new Date().toISOString();

  try {
    // 1. Lire l'utilisateur cible (notamment supabaseUid pour synchroniser les métadonnées Auth)
    const { data: targetUser } = await supabase
      .from("User")
      .select("supabaseUid")
      .eq("id", userId)
      .maybeSingle();

    // 2. Mettre à jour la table User
    const { error: userError } = await supabase
      .from("User")
      .update({
        statutCompte: dbStatus,
        updatedAt: now,
      })
      .eq("id", userId);

    if (userError) {
      throw new Error(`Erreur User : ${userError.message}`);
    }

    // 3. Mettre à jour MentorProfile (rendre disponible dès activation)
    const mentorPatch =
      dbStatus === "ACTIVE"
        ? {
            statutValidation: "ACTIVE",
            isAvailable: true,
            verifiedAt: now,
            verifiedBy: admin.id,
            updatedAt: now,
          }
        : {
            statutValidation: dbStatus,
            isAvailable: false,
            updatedAt: now,
          };

    await supabase.from("MentorProfile").update(mentorPatch).eq("userId", userId);

    // 4. Synchroniser le statut dans user_metadata Supabase Auth (best-effort)
    if (targetUser?.supabaseUid) {
      try {
        const { data: authRecord } = await supabase.auth.admin.getUserById(
          targetUser.supabaseUid
        );
        if (authRecord?.user) {
          await supabase.auth.admin.updateUserById(targetUser.supabaseUid, {
            user_metadata: {
              ...(authRecord.user.user_metadata || {}),
              status: dbStatus,
              statutCompte: dbStatus,
            },
          });
        }
      } catch (metaErr) {
        console.warn("Synchro user_metadata ignorée :", metaErr);
      }
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
  } catch (err: unknown) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur updateUserStatusAction :", err);
    return {
      success: false,
      message: "Erreur lors de la mise à jour du statut.",
    };
  }
}

/**
 * Server Action : Récupère la liste paginée/ordonnée des utilisateurs inscrits (lecture pure).
 */
export async function getRealUsersListAction(
  page = 1,
  limit = 100
): Promise<RealDatabaseUser[]> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const supabase = createAdminClient();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 200);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from("User")
      .select("*")
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (fetchError) {
      console.error("Erreur lecture table User:", fetchError.message);
      return [];
    }

    return (existingUsers || []) as RealDatabaseUser[];
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue dans getRealUsersListAction :", err);
    return [];
  }
}

/**
 * Server Action explicite : Synchronise par lots paginés les comptes Supabase Auth manquants dans User.
 */
export async function syncAuthUsersToDatabaseAction(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  const admin = await requireAdmin();
  if (!admin) {
    return {
      success: false,
      syncedCount: 0,
      message: "Accès refusé : droits administrateur requis.",
    };
  }

  const supabase = createAdminClient();

  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from("User")
      .select("supabaseUid, email");

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const existingEmails = new Set(
      (existingUsers || []).map((u) => (u.email || "").toLowerCase())
    );
    const existingUids = new Set(
      (existingUsers || []).map((u) => u.supabaseUid).filter(Boolean)
    );

    const roleMap: Record<string, string> = {
      beneficiary: "BENEFICIAIRE",
      beneficiaire: "BENEFICIAIRE",
      mentor: "MENTOR",
      expert: "EXPERT",
      partner: "PARTENAIRE",
      partenaire: "PARTENAIRE",
      admin: "ADMIN",
    };

    let page = 1;
    const perPage = 100;
    let syncedCount = 0;

    while (true) {
      const { data: authPage, error: authErr } =
        await supabase.auth.admin.listUsers({
          page,
          perPage,
        });

      if (authErr) {
        throw new Error(authErr.message);
      }

      const authUsers = authPage?.users || [];
      if (authUsers.length === 0) {
        break;
      }

      const missingAuthUsers = authUsers.filter(
        (au) =>
          au.email &&
          !existingEmails.has(au.email.toLowerCase()) &&
          !existingUids.has(au.id)
      );

      for (const missingUser of missingAuthUsers) {
        const meta = missingUser.user_metadata || {};
        const rawRole = (
          meta.role ||
          meta.account_type ||
          "BENEFICIAIRE"
        ).toLowerCase();
        const role = roleMap[rawRole] || "BENEFICIAIRE";
        const statutCompte =
          role === "BENEFICIAIRE" ? "ACTIVE" : meta.status || "PENDING";
        const rawSexe = (meta.sexe || "").toUpperCase();
        const sexe =
          rawSexe === "FEMME" ? "FEMME" : rawSexe === "HOMME" ? "HOMME" : null;
        const rawMilieu = (
          meta.milieu_residence ||
          meta.milieuResidence ||
          ""
        ).toUpperCase();
        const milieuResidence =
          rawMilieu === "RURAL"
            ? "RURAL"
            : rawMilieu === "URBAIN"
            ? "URBAIN"
            : null;
        const situationHandicap = meta.sdh === "Oui" || meta.sdh === true;

        const { error: insertError } = await supabase.from("User").insert({
          id: crypto.randomUUID(),
          supabaseUid: missingUser.id,
          email: missingUser.email!,
          nom: meta.last_name || meta.nom || "Utilisateur",
          prenom: meta.first_name || meta.prenom || "",
          telephone: missingUser.phone || meta.phone || null,
          pays: meta.country || meta.pays || "Sénégal",
          role,
          statutCompte,
          age: typeof meta.age === "number" ? meta.age : null,
          sexe,
          milieuResidence,
          situationHandicap,
          consentCgu: Boolean(meta.accept_terms),
          consentData: Boolean(meta.accept_privacy),
          createdAt: missingUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (!insertError) {
          syncedCount++;
          existingEmails.add(missingUser.email!.toLowerCase());
          existingUids.add(missingUser.id);
        }
      }

      if (authUsers.length < perPage) {
        break;
      }
      page++;
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      syncedCount,
      message: `${syncedCount} compte(s) synchronisé(s) avec succès.`,
    };
  } catch (err: unknown) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur syncAuthUsersToDatabaseAction :", err);
    return {
      success: false,
      syncedCount: 0,
      message: "Erreur lors de la synchronisation des comptes.",
    };
  }
}

/**
 * Server Action : Récupère les opportunités réelles depuis la base de données
 */
export async function getRealOpportunitiesAction(): Promise<
  RealOpportunityRow[]
> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const supabase = createAdminClient();

  try {
    const { data: opps, error } = await supabase
      .from("Opportunity")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error || !opps) {
      console.error("Erreur getRealOpportunitiesAction :", error?.message);
      return [];
    }

    return opps as RealOpportunityRow[];
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue dans getRealOpportunitiesAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère les masterclasses réelles depuis la base de données
 */
export async function getRealMasterclassesAction(): Promise<
  RealMasterclassRow[]
> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const supabase = createAdminClient();

  try {
    const { data: mc, error } = await supabase
      .from("Masterclass")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error || !mc) {
      console.error("Erreur getRealMasterclassesAction :", error?.message);
      return [];
    }

    return mc as RealMasterclassRow[];
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur inattendue dans getRealMasterclassesAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère le flux réel d'activités depuis la base de données
 */
export async function getRecentAdminActivitiesAction(): Promise<
  RecentAdminActivity[]
> {
  const admin = await requireAdmin();
  if (!admin) {
    return [];
  }

  const supabase = createAdminClient();

  try {
    // Récupérer les 5 derniers utilisateurs inscrits
    const { data: recentUsers } = await supabase
      .from("User")
      .select("id, nom, prenom, role, email, createdAt, statutCompte")
      .order("createdAt", { ascending: false })
      .limit(5);

    if (!recentUsers || recentUsers.length === 0) {
      return [];
    }

    return recentUsers.map((u) => {
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
        description: `Compte ${roleLabel} (${u.email}) - Statut : ${u.statutCompte}`,
        timestamp: dateStr,
        userRole: u.role.toLowerCase(),
      };
    });
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    console.error("Erreur getRecentAdminActivitiesAction :", err);
    return [];
  }
}
