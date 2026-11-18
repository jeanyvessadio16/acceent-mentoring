"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    // Messages d'erreur conviviaux en français
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
  const status = metadata.status || metadata.statutCompte || "ACTIVE";

  if (status === "SUSPENDED") {
    return {
      success: false,
      error: "Votre compte a été suspendu par l'administration.",
    };
  }

  if (status === "REJECTED") {
    return {
      success: false,
      error: "Votre candidature a été refusée par l'administration.",
    };
  }

  const userRole = metadata.role || metadata.account_type || "BENEFICIAIRE";
  const redirectUrl = getRedirectUrl({
    role: userRole,
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
      id: data.user.id,
      email: data.user.email,
      role: userRole,
    },
  };
}

/**
 * Inscription complète avec rôle et informations démographiques via Supabase Auth
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

  const { error } = await supabase.auth.signUp({
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

  const redirectUrl = getRedirectUrl({
    role: data.accountType,
    user_metadata: {
      role: data.accountType,
      diagnostic_completed: false,
      status: data.accountType === "beneficiary" ? "ACTIVE" : "PENDING",
    },
  });
  const dashboardUrl = getDashboardUrl(data.accountType);

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Compte créé avec succès ! Vérifiez votre boîte email si une confirmation est requise.",
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
    message: "Si un compte est associé à cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.",
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
