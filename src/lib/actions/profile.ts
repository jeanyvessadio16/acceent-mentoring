"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";
import { clearSessionCookies } from "@/lib/auth/session";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { calculateProfileCompletion } from "@/lib/utils/profile-completion";
import { validateProfilePhotoBuffer } from "@/lib/utils/avatar-upload";

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

  completionScore: number;
  missingFields: string[];
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

interface UsersMeApiResponse {
  id: string;
  supabaseUid?: string | null;
  email: string;
  prenom?: string | null;
  nom?: string | null;
  telephone?: string | null;
  pays?: string | null;
  role?: string | null;
  statutCompte?: string | null;
  age?: number | null;
  sexe?: string | null;
  milieuResidence?: string | null;
  situationHandicap?: boolean | null;
  langue?: string | null;
  createdAt: string;
  profile?: {
    id?: string;
    photoUrl?: string | null;
    ville?: string | null;
    localisation?: string | null;
    niveauEtude?: string | null;
    secteurActivite?: string | null;
    anneesExperience?: number | null;
    competences?: string[] | null;
    centresInteret?: string[] | null;
    objectifs?: string[] | null;
    langues?: string[] | null;
    disponibilite?: string | null;
    isPublic?: boolean | null;
  } | null;
  mentorProfile?: {
    id: string;
    fonction?: string | null;
    organisation?: string | null;
    anneesExperience?: number | null;
    expertises?: string[] | null;
    secteurs?: string[] | null;
    biographie?: string | null;
    typesMentoring?: string | null;
    linkedinUrl?: string | null;
    statutValidation?: string | null;
    isAvailable?: boolean | null;
  } | null;
}

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
 * Server Action : Récupère le profil complet de l'utilisateur connecté via `GET /users/me`
 */
export async function getCurrentUserProfile(): Promise<UserFullProfile | null> {
  const res = await apiRequest<UsersMeApiResponse>("/users/me");
  if (!res.ok || !res.data) {
    return null;
  }

  const userRecord = res.data;
  const rawProfile = userRecord.profile;
  const rawMentor = userRecord.mentorProfile;

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
    supabaseUid: userRecord.supabaseUid || userRecord.id,
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
}

/**
 * Server Action : Met à jour le profil via `PATCH /users/me` (et `PATCH /mentors/me` si applicable)
 */
export async function updateUserFullProfileAction(
  payload: unknown
): Promise<ProfileActionResult> {
  const parsed = profileUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Les données saisies comportent des erreurs.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const userPatchRes = await apiRequest<{ role?: string }>("/users/me", {
    method: "PATCH",
    body: {
      prenom: data.firstName.trim(),
      nom: data.lastName.trim(),
      telephone: data.phone?.trim() || undefined,
      pays: data.pays.trim(),
      age: data.age ?? undefined,
      sexe: data.sexe === "HOMME" || data.sexe === "FEMME" ? data.sexe : undefined,
      milieuResidence:
        data.milieuResidence === "RURAL" || data.milieuResidence === "URBAIN"
          ? data.milieuResidence
          : undefined,
      situationHandicap: data.situationHandicap,
      photoUrl: data.photoUrl || undefined,
      ville: data.ville?.trim() || undefined,
      localisation: data.localisation?.trim() || undefined,
      niveauEtude: data.niveauEtude?.trim() || undefined,
      secteurActivite: data.secteurActivite?.trim() || undefined,
      anneesExperience: data.anneesExperience,
      competences: data.competences,
      centresInteret: data.centresInteret,
      objectifs: data.objectifs,
      langues: data.langues,
      disponibilite: data.disponibilite?.trim() || undefined,
      isPublic: data.isPublic,
    },
  });

  if (!userPatchRes.ok || !userPatchRes.data) {
    return {
      success: false,
      message:
        userPatchRes.error ||
        "Échec de l'enregistrement des coordonnées utilisateur.",
    };
  }

  const role = userPatchRes.data.role;
  if (
    (role === "MENTOR" || role === "EXPERT") &&
    (data.fonction || data.organisation || data.biographie)
  ) {
    const mentorPatchRes = await apiRequest("/mentors/me", {
      method: "PATCH",
      body: {
        fonction: data.fonction?.trim() || undefined,
        organisation: data.organisation?.trim() || undefined,
        anneesExperience: data.anneesExperience,
        biographie: data.biographie?.trim() || undefined,
        photoUrl: data.photoUrl || undefined,
        typesMentoring: data.typesMentoring || "INDIVIDUEL",
        linkedinUrl: data.linkedinUrl || undefined,
        expertises: data.competences.length > 0 ? data.competences : undefined,
        secteurs: data.secteurActivite?.trim()
          ? [data.secteurActivite.trim()]
          : undefined,
        langues: data.langues.length > 0 ? data.langues : undefined,
      },
    });

    if (!mentorPatchRes.ok) {
      return {
        success: false,
        message:
          mentorPatchRes.error ||
          "Échec de l'enregistrement de votre profil mentor.",
      };
    }
  }

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

  revalidateAllProfilePaths();

  return {
    success: true,
    message: "Votre profil a été mis à jour et enregistré avec succès !",
    completionScore: score,
  };
}

/**
 * Server Action : Téléverse une photo de profil via `POST /users/me/avatar`
 */
export async function uploadProfilePhotoAction(
  formData: FormData
): Promise<PhotoUploadResult> {
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

  const base64Data = `data:${validation.mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
  const res = await apiRequest<{ photoUrl?: string | null; message?: string }>(
    "/users/me/avatar",
    {
      method: "POST",
      body: { base64Data },
    }
  );

  if (!res.ok || !res.data) {
    return {
      success: false,
      message:
        res.error || "Échec du téléversement de l'image. Veuillez réessayer.",
    };
  }

  revalidateAllProfilePaths();

  return {
    success: true,
    photoUrl: res.data.photoUrl ?? null,
    message: res.data.message || "Photo de profil mise à jour avec succès !",
  };
}

/**
 * Server Action : Supprime la photo de profil actuelle via `DELETE /users/me/avatar`
 */
export async function deleteProfilePhotoAction(): Promise<PhotoUploadResult> {
  const res = await apiRequest<{ photoUrl?: string | null; message?: string }>(
    "/users/me/avatar",
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return {
      success: false,
      message: res.error || "Impossible de supprimer la photo de votre profil.",
    };
  }

  revalidateAllProfilePaths();

  return {
    success: true,
    photoUrl: null,
    message: res.data?.message || "Photo de profil supprimée.",
  };
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

  await clearSessionCookies();
  revalidatePath("/", "layout");

  return {
    success: true,
    message:
      res.data?.message ||
      "Votre compte et vos données personnelles ont été supprimés.",
  };
}
