"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDbUserByAuth } from "@/lib/supabase/user-lookup";
import { loginSchema, forgotPasswordSchema, registerSchema } from "@/lib/schemas/auth";
import { ROUTES } from "@/lib/constants";
import { getDashboardUrl, getRedirectUrl } from "@/lib/utils/auth-redirect";

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
      errorMessage = "Veuillez confirmer votre adresse email avant de vous connecter.";
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
    MentorProfile?: { statutValidation?: string } | Array<{ statutValidation?: string }> | null;
    Diagnostic?: { isCompleted?: boolean } | Array<{ isCompleted?: boolean }> | null;
  }>(
    adminDb,
    { id: data.user.id, email: data.user.email },
    "id, email, role, statutCompte, MentorProfile(statutValidation), Diagnostic(isCompleted)"
  );

  const status = dbUser?.statutCompte || metadata.status || metadata.statutCompte || "ACTIVE";

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

  const userRole = dbUser?.role || metadata.role || metadata.account_type || "BENEFICIAIRE";

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
  values: unknown
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Les données fournies ne respectent pas le format attendu.",
    };
  }

  const data = parsed.data;
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

  const normalizedRole = ROLE_MAP[data.accountType.toLowerCase()] || "BENEFICIAIRE";
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

  // Synchronisation immédiate dans PostgreSQL
  if (signUpData?.user) {
    const adminDb = createAdminClient();
    const { data: existingDbUser } = await findDbUserByAuth<{ id: string }>(
      adminDb,
      { id: signUpData.user.id, email: data.email },
      "id"
    );

    if (!existingDbUser) {
      const now = new Date().toISOString();
      const newUserId = crypto.randomUUID();

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

      if (insertUserErr && insertUserErr.code !== "23505") {
        console.error("Erreur insertion User après register :", insertUserErr.message);
      } else if (!insertUserErr) {
        await adminDb.from("UserProfile").insert({
          id: crypto.randomUUID(),
          userId: newUserId,
          competences: [],
          centresInteret: [],
          objectifs: [],
          langues: ["fr"],
          createdAt: now,
          updatedAt: now,
        });

        if (normalizedRole === "MENTOR") {
          await adminDb.from("MentorProfile").insert({
            id: crypto.randomUUID(),
            userId: newUserId,
            fonction: "En attente de renseignement",
            organisation: "Non renseigné",
            anneesExperience: 0,
            expertises: [],
            secteurs: [],
            langues: ["fr"],
            publicsAccompagnes: [],
            biographie: "Profil mentor en cours de complétion.",
            statutValidation: "PENDING",
            isAvailable: false,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  }

  const redirectUrl = getRedirectUrl({
    role: normalizedRole,
    mentorProfile:
      normalizedRole === "MENTOR" ? { statutValidation: "PENDING" } : null,
    diagnostic: normalizedRole === "BENEFICIAIRE" ? { isCompleted: false } : null,
    user_metadata: {
      role: normalizedRole,
      diagnostic_completed: false,
      status: statutCompte,
    },
  });
  const dashboardUrl = getDashboardUrl(normalizedRole);

  revalidatePath("/", "layout");
  return {
    success: true,
    message:
      "Compte créé avec succès ! Vérifiez votre boîte email si une confirmation est requise.",
    redirectUrl,
    dashboardUrl,
  };
}

/**
 * Réinitialisation du mot de passe (envoi d'email avec lien magique / token)
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

  const { error } = await supabase.auth.resetPasswordForEmail(email);

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
