"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/schemas/profile";
import { calculateProfileCompletion } from "@/lib/utils/profile-completion";

export interface UserFullProfile {
  id: string;
  supabaseUid: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  pays: string;
  role: string;
  statutCompte: string;
  age: number | null;
  sexe: "HOMME" | "FEMME" | null;
  milieuResidence: "RURAL" | "URBAIN" | null;
  situationHandicap: boolean;
  langue: string;
  createdAt: string;

  // Profil étendu (UserProfile)
  profileId?: string;
  photoUrl: string | null;
  ville: string | null;
  localisation: string | null;
  niveauEtude: string | null;
  secteurActivite: string | null;
  anneesExperience: number;
  competences: string[];
  centresInteret: string[];
  objectifs: string[];
  langues: string[];
  disponibilite: string | null;
  isPublic: boolean;

  // Profil Mentor (si applicable)
  mentorProfile?: {
    id: string;
    fonction: string;
    organisation: string;
    anneesExperience: number;
    expertises: string[];
    secteurs: string[];
    biographie: string;
    typesMentoring: string;
    linkedinUrl: string | null;
    statutValidation: string;
  } | null;

  // Métriques de complétion
  completionScore: number;
  missingFields: string[];
}

/**
 * Server Action : Récupère le profil complet de l'utilisateur connecté
 */
export async function getCurrentUserProfile(): Promise<UserFullProfile | null> {
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

    // 1. Récupération dans la table User avec relations UserProfile et MentorProfile
    const { data: dbUser, error: userError } = await findDbUserByAuth(
      adminDb,
      authUser,
      `
        id, supabaseUid, email, nom, prenom, telephone, pays, role, statutCompte,
        age, sexe, milieuResidence, situationHandicap, langue, createdAt,
        UserProfile (*),
        MentorProfile (*)
      `
    );

    if (userError) {
      console.error("Erreur lors de la lecture du profil utilisateur :", userError.message);
    }

    // Si l'utilisateur n'est pas encore dans la table User, l'insérer immédiatement
    let userRecord = dbUser;
    if (!userRecord) {
      const meta = authUser.user_metadata || {};
      const newUserId = crypto.randomUUID();
      const rawRole = (meta.role || meta.account_type || "BENEFICIAIRE").toUpperCase();
      const role = rawRole === "BENEFICIARY" ? "BENEFICIAIRE" : rawRole;
      const sexe = meta.sexe === "Femme" ? "FEMME" : meta.sexe === "Homme" ? "HOMME" : null;
      const milieu = meta.milieu_residence === "Rural" ? "RURAL" : meta.milieu_residence === "Urbain" ? "URBAIN" : null;

      const { data: createdUser } = await adminDb
        .from("User")
        .insert({
          id: newUserId,
          supabaseUid: authUser.id,
          email: authUser.email!,
          nom: meta.last_name || meta.nom || "Utilisateur",
          prenom: meta.first_name || meta.prenom || "",
          telephone: meta.phone || null,
          pays: meta.country || "Sénégal",
          role,
          statutCompte: role === "BENEFICIAIRE" ? "ACTIVE" : "PENDING",
          age: typeof meta.age === "number" ? meta.age : null,
          sexe,
          milieuResidence: milieu,
          situationHandicap: meta.sdh === "Oui" || meta.sdh === true,
          langue: "fr",
          createdAt: authUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      userRecord = createdUser;
    }

    if (!userRecord) {
      return null;
    }

    const rawProfile = Array.isArray(userRecord.UserProfile)
      ? userRecord.UserProfile[0]
      : userRecord.UserProfile;

    const rawMentor = Array.isArray(userRecord.MentorProfile)
      ? userRecord.MentorProfile[0]
      : userRecord.MentorProfile;

    // Calcul de la complétion du profil
    const { score, missing } = calculateProfileCompletion({
      prenom: userRecord.prenom,
      nom: userRecord.nom,
      telephone: userRecord.telephone,
      age: userRecord.age,
      sexe: userRecord.sexe,
      milieuResidence: userRecord.milieuResidence,
      ville: rawProfile?.ville,
      pays: userRecord.pays,
      niveauEtude: rawProfile?.niveauEtude,
      secteurActivite: rawProfile?.secteurActivite,
      competences: rawProfile?.competences,
      objectifs: rawProfile?.objectifs,
      disponibilite: rawProfile?.disponibilite,
    });

    return {
      id: userRecord.id,
      supabaseUid: userRecord.supabaseUid || authUser.id,
      email: userRecord.email,
      prenom: userRecord.prenom || "",
      nom: userRecord.nom || "",
      telephone: userRecord.telephone || null,
      pays: userRecord.pays || "Sénégal",
      role: userRecord.role || "BENEFICIAIRE",
      statutCompte: userRecord.statutCompte || "ACTIVE",
      age: userRecord.age ?? null,
      sexe: userRecord.sexe || null,
      milieuResidence: userRecord.milieuResidence || null,
      situationHandicap: Boolean(userRecord.situationHandicap),
      langue: userRecord.langue || "fr",
      createdAt: userRecord.createdAt,

      profileId: rawProfile?.id,
      photoUrl: rawProfile?.photoUrl || null,
      ville: rawProfile?.ville || null,
      localisation: rawProfile?.localisation || null,
      niveauEtude: rawProfile?.niveauEtude || null,
      secteurActivite: rawProfile?.secteurActivite || null,
      anneesExperience: rawProfile?.anneesExperience ?? 0,
      competences: rawProfile?.competences || [],
      centresInteret: rawProfile?.centresInteret || [],
      objectifs: rawProfile?.objectifs || [],
      langues: rawProfile?.langues && rawProfile.langues.length > 0 ? rawProfile.langues : ["Français"],
      disponibilite: rawProfile?.disponibilite || null,
      isPublic: rawProfile?.isPublic ?? true,

      mentorProfile: rawMentor
        ? {
          id: rawMentor.id,
          fonction: rawMentor.fonction || "",
          organisation: rawMentor.organisation || "",
          anneesExperience: rawMentor.anneesExperience || 0,
          expertises: rawMentor.expertises || [],
          secteurs: rawMentor.secteurs || [],
          biographie: rawMentor.biographie || "",
          typesMentoring: rawMentor.typesMentoring || "INDIVIDUEL",
          linkedinUrl: rawMentor.linkedinUrl || null,
          statutValidation: rawMentor.statutValidation || "PENDING",
        }
        : null,

      completionScore: score,
      missingFields: missing,
    };
  } catch (error: any) {
    if (
      error?.digest === "HANGING_PROMISE_REJECTION" ||
      (typeof error?.digest === "string" && error.digest.startsWith("NEXT_"))
    ) {
      throw error;
    }
    console.error("Erreur inattendue getCurrentUserProfile :", error);
    return null;
  }
}

export type ProfileActionResult = {
  success: boolean;
  message: string;
  completionScore?: number;
  errors?: Record<string, string[]>;
};

/**
 * Server Action : Met à jour et complète le profil de l'utilisateur connecté
 */
export async function updateUserFullProfileAction(
  payload: unknown
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        message: "Vous devez être connecté pour modifier votre profil.",
      };
    }

    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Les données saisies comportent des erreurs.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;
    const adminDb = createAdminClient();

    // 1. Récupérer l'utilisateur existant
    const { data: dbUser, error: findError } = await findDbUserByAuth<{
      id: string;
      role: string;
      UserProfile: { id: string } | Array<{ id: string }> | null;
      MentorProfile: { id: string } | Array<{ id: string }> | null;
    }>(adminDb, authUser, "id, role, UserProfile(id), MentorProfile(id)");

    if (findError || !dbUser) {
      return {
        success: false,
        message: "Impossible de localiser votre compte utilisateur.",
      };
    }

    const now = new Date().toISOString();

    // 2. Mise à jour de la table User (Informations de base & Inclusion)
    const { error: userUpdateError } = await adminDb
      .from("User")
      .update({
        prenom: data.firstName.trim(),
        nom: data.lastName.trim(),
        telephone: data.phone?.trim() || null,
        pays: data.pays.trim(),
        age: data.age ?? null,
        sexe: data.sexe === "HOMME" || data.sexe === "FEMME" ? data.sexe : null,
        milieuResidence:
          data.milieuResidence === "RURAL" || data.milieuResidence === "URBAIN"
            ? data.milieuResidence
            : null,
        situationHandicap: data.situationHandicap,
        updatedAt: now,
      })
      .eq("id", dbUser.id);

    if (userUpdateError) {
      console.error("Erreur mise à jour User :", userUpdateError.message);
      return {
        success: false,
        message: "Échec de l'enregistrement des coordonnées utilisateur.",
      };
    }

    // 3. Mise à jour ou insertion dans UserProfile (Parcours, Compétences, Objectifs)
    const existingProfile = Array.isArray(dbUser.UserProfile)
      ? dbUser.UserProfile[0]
      : dbUser.UserProfile;

    const profileData = {
      userId: dbUser.id,
      photoUrl: data.photoUrl || null,
      ville: data.ville?.trim() || null,
      localisation: data.localisation?.trim() || null,
      niveauEtude: data.niveauEtude?.trim() || null,
      secteurActivite: data.secteurActivite?.trim() || null,
      anneesExperience: data.anneesExperience,
      competences: data.competences,
      centresInteret: data.centresInteret,
      objectifs: data.objectifs,
      langues: data.langues,
      disponibilite: data.disponibilite?.trim() || null,
      isPublic: data.isPublic,
      updatedAt: now,
    };

    if (existingProfile?.id) {
      const { error: profileUpdateError } = await adminDb
        .from("UserProfile")
        .update(profileData)
        .eq("id", existingProfile.id);

      if (profileUpdateError) {
        console.error("Erreur mise à jour UserProfile :", profileUpdateError.message);
        return {
          success: false,
          message: "Échec de l'enregistrement de votre profil détaillé.",
        };
      }
    } else {
      const { error: profileInsertError } = await adminDb.from("UserProfile").insert({
        id: crypto.randomUUID(),
        ...profileData,
        createdAt: now,
      });

      if (profileInsertError) {
        console.error("Erreur création UserProfile :", profileInsertError.message);
        return {
          success: false,
          message: "Échec de la création de votre profil détaillé.",
        };
      }
    }

    // 4. Si utilisateur est MENTOR ou EXPERT, mettre à jour MentorProfile si des informations sont renseignées
    if (dbUser.role === "MENTOR" || dbUser.role === "EXPERT") {
      const existingMentor = Array.isArray(dbUser.MentorProfile)
        ? dbUser.MentorProfile[0]
        : dbUser.MentorProfile;

      if (data.fonction || data.organisation || data.biographie) {
        const mentorData = {
          userId: dbUser.id,
          fonction: data.fonction || "Mentor",
          organisation: data.organisation || "",
          anneesExperience: data.anneesExperience,
          biographie: data.biographie || "",
          typesMentoring: data.typesMentoring || "INDIVIDUEL",
          linkedinUrl: data.linkedinUrl || null,
          updatedAt: now,
        };

        if (existingMentor?.id) {
          const { error: mentorUpdateError } = await adminDb
            .from("MentorProfile")
            .update(mentorData)
            .eq("id", existingMentor.id);

          if (mentorUpdateError) {
            console.error("Erreur mise à jour MentorProfile :", mentorUpdateError.message);
            return {
              success: false,
              message: "Échec de l'enregistrement de votre profil mentor.",
            };
          }
        } else {
          const { error: mentorInsertError } = await adminDb.from("MentorProfile").insert({
            id: crypto.randomUUID(),
            ...mentorData,
            expertises: data.competences,
            secteurs: data.secteurActivite ? [data.secteurActivite] : [],
            langues: data.langues,
            publicsAccompagnes: [],
            statutValidation: "PENDING",
            isAvailable: true,
            createdAt: now,
          });

          if (mentorInsertError) {
            console.error("Erreur création MentorProfile :", mentorInsertError.message);
            return {
              success: false,
              message: "Échec de la création de votre profil mentor.",
            };
          }
        }
      }
    }

    // 5. Calculer le nouveau score de complétion
    const { score } = calculateProfileCompletion({
      prenom: data.firstName,
      nom: data.lastName,
      telephone: data.phone,
      age: data.age,
      sexe: data.sexe,
      milieuResidence: data.milieuResidence,
      ville: data.ville,
      pays: data.pays,
      niveauEtude: data.niveauEtude,
      secteurActivite: data.secteurActivite,
      competences: data.competences,
      objectifs: data.objectifs,
      disponibilite: data.disponibilite,
    });

    // 6. Revalidation des chemins de cache Next.js
    revalidatePath("/beneficiary/profile");
    revalidatePath("/admin/profile");
    revalidatePath("/mentor/profile");
    revalidatePath("/expert/profile");
    revalidatePath("/partenaire/profile");
    revalidatePath("/profile");
    revalidatePath("/dashboard/beneficiaire");
    revalidatePath("/dashboard/mentor");
    revalidatePath("/dashboard/expert");
    revalidatePath("/dashboard/partenaire");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Votre profil a été mis à jour et enregistré avec succès !",
      completionScore: score,
    };
  } catch (error: any) {
    console.error("Erreur serveur updateUserFullProfileAction :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors de l'enregistrement.",
    };
  }
}
