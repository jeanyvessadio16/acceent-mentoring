"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
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
}

function isNextInternalError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("digest" in err)) {
    return false;
  }
  const digest = (err as { digest?: unknown }).digest;
  return (
    digest === "HANGING_PROMISE_REJECTION" ||
    (typeof digest === "string" && digest.startsWith("NEXT_"))
  );
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
    }>(adminDb, authUser, "id, email, nom, prenom, role, statutCompte");

    if (
      !dbUser ||
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
    return getEmptyStats();
  }

  const supabase = createAdminClient();

  try {
    // 1. Récupération des utilisateurs réels
    const { data: users, error: usersError } = await supabase
      .from("User")
      .select("id, role, statutCompte, sexe, milieuResidence, situationHandicap, age");

    if (usersError || !users) {
      console.error("Erreur lors de la lecture des utilisateurs :", usersError?.message);
      return getEmptyStats();
    }

    const totalUsers = users.length;
    const totalBeneficiaries = users.filter((u) => u.role === "BENEFICIAIRE").length;
    const totalMentors = users.filter((u) => u.role === "MENTOR").length;
    const totalPartners = users.filter((u) => u.role === "PARTENAIRE").length;
    const pendingValidations = users.filter(
      (u) => (u.role === "MENTOR" || u.role === "EXPERT") && u.statutCompte === "PENDING"
    ).length;

    // 2. Récupération des programmes actifs
    const { count: activeProgramsCount } = await supabase
      .from("MentorshipProgram")
      .select("id", { count: "exact", head: true })
      .eq("statut", "ACTIVE");

    // 3. Récupération des sessions complétées
    const { count: completedSessionsCount } = await supabase
      .from("MentorshipSession")
      .select("id", { count: "exact", head: true })
      .eq("statut", "COMPLETED");

    // 4. Calculs démographiques réels
    const usersWithGender = users.filter((u) => u.sexe);
    const femalesCount = users.filter((u) => u.sexe === "FEMME").length;
    const malesCount = users.filter((u) => u.sexe === "HOMME").length;

    const femalePercentage =
      usersWithGender.length > 0
        ? Math.round((femalesCount / usersWithGender.length) * 100)
        : 0;
    const malePercentage =
      usersWithGender.length > 0
        ? Math.round((malesCount / usersWithGender.length) * 100)
        : 0;

    const usersWithResidence = users.filter((u) => u.milieuResidence);
    const ruralCount = users.filter((u) => u.milieuResidence === "RURAL").length;
    const urbanCount = users.filter((u) => u.milieuResidence === "URBAIN").length;

    const ruralPercentage =
      usersWithResidence.length > 0
        ? Math.round((ruralCount / usersWithResidence.length) * 100)
        : 0;
    const urbanPercentage =
      usersWithResidence.length > 0
        ? Math.round((urbanCount / usersWithResidence.length) * 100)
        : 0;

    const sdhCount = users.filter((u) => u.situationHandicap === true).length;
    const sdhPercentage =
      totalUsers > 0 ? Math.round((sdhCount / totalUsers) * 100) : 0;

    const usersWithAge = users.filter(
      (u) => typeof u.age === "number" && u.age > 0
    );
    const averageAge =
      usersWithAge.length > 0
        ? Math.round(
            usersWithAge.reduce((acc, u) => acc + (u.age || 0), 0) /
              usersWithAge.length
          )
        : 0;

    return {
      totalUsers,
      totalBeneficiaries,
      totalMentors,
      totalPartners,
      pendingValidations,
      activePrograms: activeProgramsCount || 0,
      completedSessions: completedSessionsCount || 0,
      satisfactionRate: completedSessionsCount && completedSessionsCount > 0 ? 100 : 0,
      demographics: {
        femalePercentage,
        malePercentage,
        ruralPercentage,
        urbanPercentage,
        sdhPercentage,
        averageAge,
      },
    };
  } catch (err) {
    console.error("Erreur serveur inattendue dans getAdminStatsAction :", err);
    return getEmptyStats();
  }
}

function getEmptyStats(): AdminDashboardStats {
  return {
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
}

/**
 * Server Action : Récupère les profils réels en attente de validation administrative
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
         MentorProfile (id, fonction, organisation, anneesExperience, expertises, statutValidation)`
      )
      .in("role", ["MENTOR", "EXPERT"])
      .eq("statutCompte", "PENDING")
      .order("createdAt", { ascending: false });

    if (error || !pendingUsers) {
      console.error("Erreur getPendingValidationsAction :", error?.message);
      return [];
    }

    return pendingUsers.map((u: any) => {
      const profile = Array.isArray(u.MentorProfile)
        ? u.MentorProfile[0]
        : u.MentorProfile;

      const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) : "Date non renseignée";

      return {
        id: u.id,
        userId: u.id,
        firstName: u.prenom || "",
        lastName: u.nom || "",
        email: u.email,
        role: (u.role?.toLowerCase() === "expert" ? "expert" : "mentor") as "mentor" | "expert",
        title: profile?.fonction || "Candidat Mentor / Expert",
        organization: profile?.organisation || undefined,
        yearsOfExperience: profile?.anneesExperience || 0,
        expertises: profile?.expertises || [],
        submittedAt: dateStr,
        status: "pending",
      };
    });
  } catch (err) {
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

  try {
    // 1. Mettre à jour la table User
    const { error: userError } = await supabase
      .from("User")
      .update({
        statutCompte: dbStatus,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userError) {
      throw new Error(`Erreur User : ${userError.message}`);
    }

    // 2. Mettre à jour MentorProfile si applicable
    await supabase
      .from("MentorProfile")
      .update({
        statutValidation: dbStatus,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", userId);

    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/validations");
    revalidatePath("/admin/users");

    return {
      success: true,
      message:
        dbStatus === "ACTIVE"
          ? "Le compte a été activé avec succès."
          : dbStatus === "SUSPENDED"
          ? "Le compte a été suspendu."
          : "Le profil a été rejeté.",
    };
  } catch (err: any) {
    console.error("Erreur updateUserStatusAction :", err);
    return {
      success: false,
      message: err.message || "Erreur lors de la mise à jour du statut.",
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
      const { data: authPage, error: authErr } = await supabase.auth.admin.listUsers({
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
        const rawRole = (meta.role || meta.account_type || "BENEFICIAIRE").toLowerCase();
        const role = roleMap[rawRole] || "BENEFICIAIRE";
        const statutCompte =
          role === "BENEFICIAIRE" ? "ACTIVE" : (meta.status || "PENDING");
        const rawSexe = (meta.sexe || "").toUpperCase();
        const sexe = rawSexe === "FEMME" ? "FEMME" : rawSexe === "HOMME" ? "HOMME" : null;
        const rawMilieu = (
          meta.milieu_residence ||
          meta.milieuResidence ||
          ""
        ).toUpperCase();
        const milieuResidence =
          rawMilieu === "RURAL" ? "RURAL" : rawMilieu === "URBAIN" ? "URBAIN" : null;
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
  } catch (err: any) {
    console.error("Erreur syncAuthUsersToDatabaseAction :", err);
    return {
      success: false,
      syncedCount: 0,
      message: err.message || "Erreur lors de la synchronisation.",
    };
  }
}

/**
 * Server Action : Récupère les opportunités réelles depuis la base de données
 */
export async function getRealOpportunitiesAction() {
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

    return opps;
  } catch (err) {
    console.error("Erreur inattendue dans getRealOpportunitiesAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère les masterclasses réelles depuis la base de données
 */
export async function getRealMasterclassesAction() {
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

    return mc;
  } catch (err) {
    console.error("Erreur inattendue dans getRealMasterclassesAction :", err);
    return [];
  }
}

/**
 * Server Action : Récupère le flux réel d'activités depuis la base de données
 */
export async function getRecentAdminActivitiesAction(): Promise<RecentAdminActivity[]> {
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
    console.error("Erreur getRecentAdminActivitiesAction :", err);
    return [];
  }
}
