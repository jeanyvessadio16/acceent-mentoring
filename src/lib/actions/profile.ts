"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { calculateProfileCompletion } from "@/lib/utils/profile-completion";
import { isNextInternalError } from "@/lib/utils/next-errors";
import { apiRequest } from "@/lib/api/server-client";
import {
  PROFILE_AVATAR_BUCKET,
  validateProfilePhotoBuffer,
  buildAvatarStoragePath,
  extractOwnedAvatarStoragePath,
} from "@/lib/utils/avatar-upload";

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
    isAvailable: boolean;
  } | null;

  // Métriques de complétion
  completionScore: number;
  missingFields: string[];
}

interface DbUserProfileRow {
  id: string;
  photoUrl: string | null;
  ville: string | null;
  localisation: string | null;
  niveauEtude: string | null;
  secteurActivite: string | null;
  anneesExperience: number | null;
  competences: string[] | null;
  centresInteret: string[] | null;
  objectifs: string[] | null;
  langues: string[] | null;
  disponibilite: string | null;
  isPublic: boolean | null;
}

interface DbMentorProfileRow {
  id: string;
  fonction: string | null;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  secteurs: string[] | null;
  biographie: string | null;
  typesMentoring: string | null;
  linkedinUrl: string | null;
  statutValidation: string | null;
  isAvailable: boolean | null;
}

interface DbProfileUserRow {
  id: string;
  supabaseUid: string | null;
  email: string;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  pays: string | null;
  role: string | null;
  statutCompte: string | null;
  age: number | null;
  sexe: string | null;
  milieuResidence: string | null;
  situationHandicap: boolean | null;
  langue: string | null;
  createdAt: string;
  UserProfile?: DbUserProfileRow | DbUserProfileRow[] | null;
  MentorProfile?: DbMentorProfileRow | DbMentorProfileRow[] | null;
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
    const { data: dbUser, error: userError } =
      await findDbUserByAuth<DbProfileUserRow>(
        adminDb,
        authUser,
        `
        id, supabaseUid, email, nom, prenom, telephone, pays, role, statutCompte,
        age, sexe, milieuResidence, situationHandicap, langue, createdAt,
        UserProfile (id, photoUrl, ville, localisation, niveauEtude, secteurActivite, anneesExperience, competences, centresInteret, objectifs, langues, disponibilite, isPublic),
        MentorProfile (id, fonction, organisation, anneesExperience, expertises, secteurs, biographie, typesMentoring, linkedinUrl, statutValidation, isAvailable)
      `
      );

    if (userError) {
      console.error("Erreur lors de la lecture du profil utilisateur :", userError.message);
    }

    // Si l'utilisateur n'est pas encore dans la table User, l'insérer immédiatement
    let userRecord: DbProfileUserRow | null = dbUser;
    if (!userRecord) {
      const ALLOWED_AUTO_PROVISION_ROLES = new Set([
        "BENEFICIAIRE",
        "MENTOR",
        "EXPERT",
        "PARTENAIRE",
      ]);
      const meta = authUser.user_metadata || {};
      const newUserId = crypto.randomUUID();
      const rawRole = (meta.role || meta.account_type || "BENEFICIAIRE").toUpperCase();
      const mappedRole =
        rawRole === "BENEFICIARY"
          ? "BENEFICIAIRE"
          : rawRole === "PARTNER"
          ? "PARTENAIRE"
          : rawRole;
      const role = ALLOWED_AUTO_PROVISION_ROLES.has(mappedRole)
        ? mappedRole
        : "BENEFICIAIRE";
      const sexe = meta.sexe === "Femme" ? "FEMME" : meta.sexe === "Homme" ? "HOMME" : null;
      const milieu = meta.milieu_residence === "Rural" ? "RURAL" : meta.milieu_residence === "Urbain" ? "URBAIN" : null;

      const { data: createdUser } = await adminDb
        .from("User")
        .insert({
          id: newUserId,
          supabaseUid: authUser.id,
          email: authUser.email!,
          nom: meta.last_name || meta.nom || "",
          prenom: meta.first_name || meta.prenom || "",
          telephone: meta.phone || null,
          pays: meta.country || "",
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

      userRecord = createdUser as DbProfileUserRow | null;
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
      pays: userRecord.pays || "",
      role: userRecord.role || "BENEFICIAIRE",
      statutCompte: userRecord.statutCompte || "ACTIVE",
      age: userRecord.age ?? null,
      sexe: (userRecord.sexe as "HOMME" | "FEMME" | null) || null,
      milieuResidence:
        (userRecord.milieuResidence as "RURAL" | "URBAIN" | null) || null,
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
      langues: rawProfile?.langues || [],
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
          isAvailable: rawMentor.isAvailable ?? true,
        }
        : null,

      completionScore: score,
      missingFields: missing,
    };
  } catch (error: unknown) {
    if (isNextInternalError(error)) {
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

export type PhotoUploadResult = {
  success: boolean;
  message: string;
  photoUrl?: string | null;
};

function revalidateAllProfilePaths() {
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
  revalidatePath("/beneficiary/mentors");
}

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
          photoUrl: data.photoUrl || null,
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
    revalidateAllProfilePaths();

    return {
      success: true,
      message: "Votre profil a été mis à jour et enregistré avec succès !",
      completionScore: score,
    };
  } catch (error: unknown) {
    console.error("Erreur serveur updateUserFullProfileAction :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors de l'enregistrement.",
    };
  }
}

/**
 * Server Action : Téléverse une photo de profil vers le bucket Supabase Storage `plateforme-images`
 * et met à jour `UserProfile.photoUrl` (et `MentorProfile.photoUrl` si applicable).
 */
export async function uploadProfilePhotoAction(
  formData: FormData
): Promise<PhotoUploadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        message: "Vous devez être connecté pour téléverser une photo.",
      };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return {
        success: false,
        message: "Aucun fichier image sélectionné.",
      };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateProfilePhotoBuffer(file.size, bytes);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error,
      };
    }

    const adminDb = createAdminClient();
    const { data: dbUser, error: findError } = await findDbUserByAuth<{
      id: string;
      role: string;
      UserProfile: { id: string; photoUrl: string | null } | Array<{ id: string; photoUrl: string | null }> | null;
      MentorProfile: { id: string } | Array<{ id: string }> | null;
    }>(adminDb, authUser, "id, role, UserProfile(id, photoUrl), MentorProfile(id)");

    if (findError || !dbUser) {
      return {
        success: false,
        message: "Impossible de localiser votre compte utilisateur.",
      };
    }

    const storagePath = buildAvatarStoragePath(dbUser.id, validation.ext);
    const { error: uploadError } = await adminDb.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(storagePath, Buffer.from(bytes), {
        contentType: validation.mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Erreur uploadProfilePhotoAction storage :", uploadError.message);
      return {
        success: false,
        message: "Échec du téléversement de l'image. Veuillez réessayer.",
      };
    }

    const {
      data: { publicUrl },
    } = adminDb.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(storagePath);

    const existingProfile = Array.isArray(dbUser.UserProfile)
      ? dbUser.UserProfile[0]
      : dbUser.UserProfile;
    const existingMentor = Array.isArray(dbUser.MentorProfile)
      ? dbUser.MentorProfile[0]
      : dbUser.MentorProfile;

    const now = new Date().toISOString();
    let dbError: { message: string } | null = null;

    if (existingProfile?.id) {
      const { error } = await adminDb
        .from("UserProfile")
        .update({
          photoUrl: publicUrl,
          updatedAt: now,
        })
        .eq("id", existingProfile.id);
      dbError = error;
    } else {
      const { error } = await adminDb.from("UserProfile").insert({
        id: crypto.randomUUID(),
        userId: dbUser.id,
        photoUrl: publicUrl,
        anneesExperience: 0,
        competences: [],
        centresInteret: [],
        objectifs: [],
        langues: [],
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
      dbError = error;
    }

    if (dbError) {
      console.error("Erreur sauvegarde UserProfile.photoUrl :", dbError.message);
      // Rollback best-effort du fichier fraîchement téléversé
      await adminDb.storage.from(PROFILE_AVATAR_BUCKET).remove([storagePath]);
      return {
        success: false,
        message: "Impossible d'enregistrer la photo dans votre profil.",
      };
    }

    if (existingMentor?.id) {
      await adminDb
        .from("MentorProfile")
        .update({
          photoUrl: publicUrl,
          updatedAt: now,
        })
        .eq("id", existingMentor.id);
    }

    // Nettoyage best-effort de l'ancienne photo dans le dossier utilisateur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const oldPath = extractOwnedAvatarStoragePath(
      existingProfile?.photoUrl,
      supabaseUrl,
      dbUser.id
    );
    if (oldPath && oldPath !== storagePath) {
      await adminDb.storage.from(PROFILE_AVATAR_BUCKET).remove([oldPath]);
    }

    revalidateAllProfilePaths();

    return {
      success: true,
      photoUrl: publicUrl,
      message: "Photo de profil mise à jour avec succès !",
    };
  } catch (error) {
    console.error("Erreur serveur uploadProfilePhotoAction :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors du téléversement.",
    };
  }
}

/**
 * Server Action : Supprime la photo de profil actuelle de l'utilisateur connecté
 */
export async function deleteProfilePhotoAction(): Promise<PhotoUploadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        message: "Vous devez être connecté pour supprimer votre photo.",
      };
    }

    const adminDb = createAdminClient();
    const { data: dbUser, error: findError } = await findDbUserByAuth<{
      id: string;
      UserProfile: { id: string; photoUrl: string | null } | Array<{ id: string; photoUrl: string | null }> | null;
      MentorProfile: { id: string } | Array<{ id: string }> | null;
    }>(adminDb, authUser, "id, UserProfile(id, photoUrl), MentorProfile(id)");

    if (findError || !dbUser) {
      return {
        success: false,
        message: "Impossible de localiser votre compte utilisateur.",
      };
    }

    const existingProfile = Array.isArray(dbUser.UserProfile)
      ? dbUser.UserProfile[0]
      : dbUser.UserProfile;
    const existingMentor = Array.isArray(dbUser.MentorProfile)
      ? dbUser.MentorProfile[0]
      : dbUser.MentorProfile;

    const now = new Date().toISOString();

    if (existingProfile?.id) {
      const { error } = await adminDb
        .from("UserProfile")
        .update({
          photoUrl: null,
          updatedAt: now,
        })
        .eq("id", existingProfile.id);

      if (error) {
        return {
          success: false,
          message: "Impossible de supprimer la photo de votre profil.",
        };
      }
    }

    if (existingMentor?.id) {
      await adminDb
        .from("MentorProfile")
        .update({
          photoUrl: null,
          updatedAt: now,
        })
        .eq("id", existingMentor.id);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const oldPath = extractOwnedAvatarStoragePath(
      existingProfile?.photoUrl,
      supabaseUrl,
      dbUser.id
    );
    if (oldPath) {
      await adminDb.storage.from(PROFILE_AVATAR_BUCKET).remove([oldPath]);
    }

    revalidateAllProfilePaths();

    return {
      success: true,
      photoUrl: null,
      message: "Photo de profil supprimée.",
    };
  } catch (error) {
    console.error("Erreur serveur deleteProfilePhotoAction :", error);
    return {
      success: false,
      message: "Une erreur inattendue est survenue lors de la suppression.",
    };
  }
}

/**
 * Server Action : Active ou suspend la disponibilité d'un mentor (F03) via l'API NestJS
 */
export async function updateMentorAvailabilityAction(
  isAvailable: boolean
): Promise<{ success: boolean; isAvailable?: boolean; message: string }> {
  const res = await apiRequest<{ isAvailable?: boolean }>(
    "/mentors/me/availability",
    {
      method: "PATCH",
      body: { isAvailable },
    }
  );

  if (!res.ok) {
    return {
      success: false,
      message:
        res.error || "Impossible de mettre à jour votre disponibilité.",
    };
  }

  revalidateAllProfilePaths();
  revalidatePath("/mentors");
  revalidatePath("/beneficiary/mentors");

  return {
    success: true,
    isAvailable: res.data?.isAvailable ?? isAvailable,
    message: isAvailable
      ? "Votre profil est désormais visible pour recevoir de nouvelles demandes."
      : "Votre disponibilité est temporairement suspendue.",
  };
}

/**
 * Server Action : Suppression complète du compte utilisateur (RGPD - F02) via l'API NestJS
 */
export async function deleteMyAccountAction(): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await apiRequest<{ message?: string }>("/users/me", {
    method: "DELETE",
  });

  if (!res.ok) {
    return {
      success: false,
      message:
        res.error || "Impossible de supprimer votre compte pour le moment.",
    };
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Session déjà invalidée côté serveur
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message:
      res.data?.message ||
      "Votre compte et vos données personnelles ont été supprimés.",
  };
}
