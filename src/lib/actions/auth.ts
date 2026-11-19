"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import {
  loginSchema,
  forgotPasswordSchema,
  registerSchema,
} from "@/lib/schemas/auth";
import { ROUTES } from "@/lib/constants";
import { getDashboardUrl, getRedirectUrl } from "@/lib/utils/auth-redirect";
import {
  CV_STORAGE_BUCKET,
  validateCvPdfBuffer,
  buildCvStoragePath,
} from "@/lib/utils/cv-upload";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
  dashboardUrl?: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
};

const ROLE_MAP: Record<string, string> = {
  beneficiary: "BENEFICIAIRE",
  beneficiaire: "BENEFICIAIRE",
  mentor: "MENTOR",
  expert: "EXPERT",
  partner: "PARTENAIRE",
  partenaire: "PARTENAIRE",
};

/**
 * Connexion avec email et mot de passe via Supabase Auth
 */
export async function loginAction(
  values: unknown
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Veuillez vérifier les informations saisies.",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    let errorMessage = "Échec de connexion. Vérifiez vos identifiants.";
    if (error?.message.includes("Invalid login credentials")) {
      errorMessage = "Adresse email ou mot de passe incorrect.";
    } else if (error?.message.includes("Email not confirmed")) {
      errorMessage =
        "Veuillez confirmer votre adresse email avant de vous connecter.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  const metadata = data.user.user_metadata || {};
  const adminDb = createAdminClient();

  // Source de vérité PostgreSQL : statut, rôle, diagnostic, mentorProfile
  const { data: dbUser } = await findDbUserByAuth<{
    id: string;
    email: string;
    role: string;
    statutCompte: string;
    MentorProfile?:
      | { statutValidation?: string }
      | Array<{ statutValidation?: string }>
      | null;
    Diagnostic?:
      | { isCompleted?: boolean }
      | Array<{ isCompleted?: boolean }>
      | null;
  }>(
    adminDb,
    { id: data.user.id, email: data.user.email },
    "id, email, role, statutCompte, MentorProfile(statutValidation), Diagnostic(isCompleted)"
  );

  const status =
    dbUser?.statutCompte || metadata.status || metadata.statutCompte || "ACTIVE";

  if (status === "SUSPENDED") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Votre compte a été suspendu par l'administration.",
    };
  }

  if (status === "REJECTED") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Votre candidature a été refusée par l'administration.",
    };
  }

  const mentorProfile = Array.isArray(dbUser?.MentorProfile)
    ? dbUser.MentorProfile[0] ?? null
    : dbUser?.MentorProfile ?? null;

  const diagnostic = Array.isArray(dbUser?.Diagnostic)
    ? dbUser.Diagnostic[0] ?? null
    : dbUser?.Diagnostic ?? null;

  const userRole =
    dbUser?.role || metadata.role || metadata.account_type || "BENEFICIAIRE";

  const redirectUrl = getRedirectUrl({
    role: userRole,
    mentorProfile,
    diagnostic,
    user_metadata: metadata,
  });
  const dashboardUrl = getDashboardUrl(userRole);

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Connexion réussie.",
    redirectUrl,
    dashboardUrl,
    user: {
      id: dbUser?.id || data.user.id,
      email: dbUser?.email || data.user.email,
      role: userRole,
    },
  };
}

/**
 * Inscription complète avec rôle et informations démographiques via Supabase Auth + synchronisation PostgreSQL
 */
export async function registerAction(
  values: FormData | unknown
): Promise<AuthActionResult> {
  let rawPayload: unknown = values;
  let cvFile: File | null = null;

  if (values instanceof FormData) {
    const rawJson = values.get("payload");
    if (typeof rawJson === "string") {
      try {
        rawPayload = JSON.parse(rawJson);
      } catch {
        return {
          success: false,
          error: "Les données du formulaire sont invalides.",
        };
      }
    } else {
      return {
        success: false,
        error: "Les données du formulaire sont manquantes.",
      };
    }

    const cvEntry = values.get("cvFile");
    cvFile = cvEntry instanceof File && cvEntry.size > 0 ? cvEntry : null;
  }

  const parsed = registerSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        "Les données fournies ne respectent pas le format attendu.",
    };
  }

  const data = parsed.data;
  const normalizedRole =
    ROLE_MAP[data.accountType.toLowerCase()] || "BENEFICIAIRE";
  const isMentorOrExpert =
    normalizedRole === "MENTOR" || normalizedRole === "EXPERT";

  // Pré-validation stricte du CV PDF avant création du compte Supabase Auth
  let cvBytes: Uint8Array | null = null;
  if (isMentorOrExpert) {
    if (!cvFile) {
      return {
        success: false,
        error:
          "Veuillez joindre votre CV au format PDF pour soumettre votre candidature.",
      };
    }

    cvBytes = new Uint8Array(await cvFile.arrayBuffer());
    const cvValidation = validateCvPdfBuffer(cvFile.size, cvBytes);
    if (!cvValidation.valid) {
      return {
        success: false,
        error: cvValidation.error,
      };
    }
  }

  const supabase = await createClient();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.accountType,
        account_type: data.accountType,
        phone: data.phone,
        country: data.country,
        age: data.age,
        sexe: data.sexe,
        milieu_residence: data.milieuResidence,
        sdh: data.sdh,
        accept_terms: data.acceptTerms,
        accept_privacy: data.acceptPrivacy,
        newsletter: data.newsletter,
        ...(isMentorOrExpert
          ? {
              fonction: data.fonction?.trim(),
              organisation: data.organisation?.trim(),
              annees_experience: data.anneesExperience,
            }
          : {}),
      },
    },
  });

  if (error) {
    let errorMessage = "Impossible de créer le compte pour le moment.";
    if (error.message.includes("User already registered")) {
      errorMessage = "Un compte existe déjà avec cette adresse email.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  const statutCompte = normalizedRole === "BENEFICIAIRE" ? "ACTIVE" : "PENDING";
  const normalizedSexe =
    data.sexe === "Femme" ? "FEMME" : data.sexe === "Homme" ? "HOMME" : null;
  const normalizedMilieu =
    data.milieuResidence === "Rural"
      ? "RURAL"
      : data.milieuResidence === "Urbain"
      ? "URBAIN"
      : null;
  const situationHandicap = data.sdh === "Oui";

  // Synchronisation immédiate et atomique dans PostgreSQL + stockage privé du CV
  if (signUpData?.user) {
    const adminDb = createAdminClient();
    const { data: existingDbUser } = await findDbUserByAuth<{ id: string }>(
      adminDb,
      { id: signUpData.user.id, email: data.email },
      "id"
    );

    if (existingDbUser) {
      return {
        success: false,
        error: "Un compte existe déjà avec cette adresse email.",
      };
    }

    const now = new Date().toISOString();
    const newUserId = crypto.randomUUID();
    let createdDbUserId: string | null = null;
    let uploadedCvPath: string | null = null;

    const rollbackRegistration = async () => {
      if (uploadedCvPath) {
        try {
          await adminDb.storage.from(CV_STORAGE_BUCKET).remove([uploadedCvPath]);
        } catch (cleanupErr) {
          console.error("Erreur nettoyage CV lors du rollback :", cleanupErr);
        }
      }
      if (createdDbUserId) {
        try {
          await adminDb.from("User").delete().eq("id", createdDbUserId);
        } catch (dbCleanupErr) {
          console.error("Erreur suppression User lors du rollback :", dbCleanupErr);
        }
      }
      try {
        await adminDb.auth.admin.deleteUser(signUpData.user!.id);
      } catch (authCleanupErr) {
        console.error(
          "Erreur suppression Supabase Auth lors du rollback :",
          authCleanupErr
        );
      }
    };

    const { error: insertUserErr } = await adminDb.from("User").insert({
      id: newUserId,
      supabaseUid: signUpData.user.id,
      email: data.email,
      nom: data.lastName.trim(),
      prenom: data.firstName.trim(),
      telephone: data.phone || null,
      pays: data.country || "Sénégal",
      role: normalizedRole,
      statutCompte,
      age: data.age ?? null,
      sexe: normalizedSexe,
      milieuResidence: normalizedMilieu,
      situationHandicap,
      langue: "fr",
      consentCgu: Boolean(data.acceptTerms),
      consentData: Boolean(data.acceptPrivacy),
      createdAt: now,
      updatedAt: now,
    });

    if (insertUserErr) {
      console.error("Erreur insertion User après register :", insertUserErr.message);
      await rollbackRegistration();
      return {
        success: false,
        error:
          insertUserErr.code === "23505"
            ? "Un compte existe déjà avec cette adresse email."
            : "Impossible de finaliser la création du compte. Veuillez réessayer.",
      };
    }

    createdDbUserId = newUserId;

    const { error: profileInsertErr } = await adminDb
      .from("UserProfile")
      .insert({
        id: crypto.randomUUID(),
        userId: newUserId,
        anneesExperience: isMentorOrExpert ? data.anneesExperience ?? 1 : 0,
        secteurActivite:
          isMentorOrExpert && data.secteurs?.[0] ? data.secteurs[0] : null,
        competences: isMentorOrExpert ? data.expertises || [] : [],
        centresInteret: [],
        objectifs: [],
        langues: ["Français"],
        disponibilite: isMentorOrExpert
          ? data.disponibilites?.trim() || null
          : null,
        createdAt: now,
        updatedAt: now,
      });

    if (profileInsertErr) {
      console.error(
        "Erreur insertion UserProfile après register :",
        profileInsertErr.message
      );
      await rollbackRegistration();
      return {
        success: false,
        error: "Impossible d'initialiser votre profil utilisateur.",
      };
    }

    if (isMentorOrExpert) {
      if (cvBytes) {
        const cvStoragePath = buildCvStoragePath(newUserId);
        const { error: cvUploadErr } = await adminDb.storage
          .from(CV_STORAGE_BUCKET)
          .upload(cvStoragePath, Buffer.from(cvBytes), {
            contentType: "application/pdf",
            cacheControl: "3600",
            upsert: false,
          });

        if (cvUploadErr) {
          console.error("Erreur téléversement CV PDF :", cvUploadErr.message);
          await rollbackRegistration();
          return {
            success: false,
            error:
              "Impossible de téléverser votre CV PDF. L'inscription a été annulée.",
          };
        }

        uploadedCvPath = cvStoragePath;
      }

      const { error: mentorInsertErr } = await adminDb
        .from("MentorProfile")
        .insert({
          id: crypto.randomUUID(),
          userId: newUserId,
          fonction: data.fonction!.trim(),
          organisation: data.organisation!.trim(),
          anneesExperience: data.anneesExperience ?? 1,
          expertises: data.expertises || [],
          secteurs: data.secteurs || [],
          langues: ["Français"],
          publicsAccompagnes: [],
          typesMentoring: data.typesMentoring || "INDIVIDUEL",
          disponibilites: data.disponibilites?.trim() || null,
          biographie: data.biographie!.trim(),
          cvUrl: uploadedCvPath,
          linkedinUrl: data.linkedinUrl?.trim() || null,
          references: data.references?.trim() || null,
          statutValidation: "PENDING",
          isAvailable: false,
          createdAt: now,
          updatedAt: now,
        });

      if (mentorInsertErr) {
        console.error(
          "Erreur insertion MentorProfile :",
          mentorInsertErr.message
        );
        await rollbackRegistration();
        return {
          success: false,
          error:
            "Impossible d'enregistrer votre profil mentor. L'inscription a été annulée.",
        };
      }
    }
  }

  const redirectUrl = getRedirectUrl({
    role: normalizedRole,
    mentorProfile: isMentorOrExpert ? { statutValidation: "PENDING" } : null,
    diagnostic: normalizedRole === "BENEFICIAIRE" ? { isCompleted: false } : null,
    user_metadata: {
      role: normalizedRole,
      diagnostic_completed: false,
      status: statutCompte,
    },
  });
  const dashboardUrl = getDashboardUrl(normalizedRole);

  revalidatePath("/", "layout");
  revalidatePath("/admin/validations");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    message:
      "Compte créé avec succès ! Vérifiez votre boîte email si une confirmation est requise.",
    redirectUrl,
    dashboardUrl,
  };
}

/**
 * Réinitialisation du mot de passe (envoi d'email avec lien magique vers /reset-password)
 */
export async function forgotPasswordAction(
  values: unknown
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Veuillez saisir une adresse email valide.",
    };
  }

  const { email } = parsed.data;
  const supabase = await createClient();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: "Impossible d'envoyer le lien de réinitialisation pour le moment.",
    };
  }

  return {
    success: true,
    message:
      "Si un compte est associé à cette adresse, vous recevrrez un lien pour réinitialiser votre mot de passe.",
  };
}

/**
 * Déconnexion utilisateur
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.HOME);
}
