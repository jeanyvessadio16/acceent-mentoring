"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api/server-client";
import { clearSessionCookies, setSessionCookies } from "@/lib/auth/session";
import {
  loginSchema,
  forgotPasswordSchema,
  registerSchema,
} from "@/lib/schemas/auth";
import { ROUTES } from "@/lib/constants";
import { validateCvPdfBuffer } from "@/lib/utils/cv-upload";

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

interface AuthApiSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface AuthLoginApiResponse {
  message?: string;
  redirectUrl?: string;
  dashboardUrl?: string;
  session?: AuthApiSession | null;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

interface AuthRegisterApiResponse {
  message?: string;
  redirectUrl?: string;
  dashboardUrl?: string;
  session?: AuthApiSession | null;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

const ROLE_MAP: Record<string, "BENEFICIAIRE" | "MENTOR" | "EXPERT" | "PARTENAIRE"> = {
  beneficiary: "BENEFICIAIRE",
  beneficiaire: "BENEFICIAIRE",
  mentor: "MENTOR",
  expert: "EXPERT",
  partner: "PARTENAIRE",
  partenaire: "PARTENAIRE",
};

/**
 * Connexion avec email et mot de passe via l'API NestJS `/auth/login`
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

  const res = await apiRequest<AuthLoginApiResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: {
      email: parsed.data.email,
      password: parsed.data.password,
    },
  });

  if (!res.ok || !res.data) {
    return {
      success: false,
      error: res.error || "Adresse email ou mot de passe incorrect.",
    };
  }

  if (res.data.session?.accessToken) {
    await setSessionCookies(res.data.session);
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: res.data.message || "Connexion réussie.",
    redirectUrl: res.data.redirectUrl,
    dashboardUrl: res.data.dashboardUrl,
    user: res.data.user
      ? {
          id: res.data.user.id,
          email: res.data.user.email,
          role: res.data.user.role,
        }
      : undefined,
  };
}

/**
 * Inscription complète avec rôle, informations démographiques et CV PDF (Mentors/Experts)
 * via l'API NestJS `/auth/register`
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

  let cvBase64: string | undefined;
  if (isMentorOrExpert) {
    if (!cvFile) {
      return {
        success: false,
        error:
          "Veuillez joindre votre CV au format PDF pour soumettre votre candidature.",
      };
    }

    const cvBytes = new Uint8Array(await cvFile.arrayBuffer());
    const cvValidation = validateCvPdfBuffer(cvFile.size, cvBytes);
    if (!cvValidation.valid) {
      return {
        success: false,
        error: cvValidation.error,
      };
    }
    cvBase64 = Buffer.from(cvBytes).toString("base64");
  }

  const normalizedSexe =
    data.sexe === "Femme" ? "FEMME" : data.sexe === "Homme" ? "HOMME" : undefined;
  const normalizedMilieu =
    data.milieuResidence === "Rural"
      ? "RURAL"
      : data.milieuResidence === "Urbain"
      ? "URBAIN"
      : undefined;

  const res = await apiRequest<AuthRegisterApiResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      email: data.email,
      password: data.password,
      nom: data.lastName.trim(),
      prenom: data.firstName.trim(),
      age: data.age,
      sexe: normalizedSexe,
      milieuResidence: normalizedMilieu,
      situationHandicap: data.sdh === "Oui",
      telephone: data.phone || undefined,
      pays: data.country || "Sénégal",
      role: normalizedRole,
      langue: "fr",
      consentCgu: Boolean(data.acceptTerms),
      consentData: Boolean(data.acceptPrivacy),
      ...(isMentorOrExpert
        ? {
            fonction: data.fonction?.trim(),
            organisation: data.organisation?.trim(),
            anneesExperience: data.anneesExperience,
            expertises: data.expertises || [],
            secteurs: data.secteurs || [],
            typesMentoring: data.typesMentoring || "INDIVIDUEL",
            disponibilites: data.disponibilites?.trim() || undefined,
            biographie: data.biographie?.trim(),
            linkedinUrl: data.linkedinUrl?.trim() || undefined,
            references: data.references?.trim() || undefined,
            cvBase64,
          }
        : {}),
    },
  });

  if (!res.ok || !res.data) {
    return {
      success: false,
      error: res.error || "Impossible de créer le compte pour le moment.",
    };
  }

  if (res.data.session?.accessToken) {
    await setSessionCookies(res.data.session);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/validations");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    message:
      res.data.message ||
      "Compte créé avec succès ! Vérifiez votre boîte email si une confirmation est requise.",
    redirectUrl: res.data.redirectUrl,
    dashboardUrl: res.data.dashboardUrl,
  };
}

/**
 * Demande de réinitialisation du mot de passe via l'API NestJS `/auth/forgot-password`
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

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");

  const res = await apiRequest<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: {
      email: parsed.data.email,
      redirectTo: `${siteUrl}/reset-password`,
    },
  });

  if (!res.ok) {
    return {
      success: false,
      error:
        res.error ||
        "Impossible d'envoyer le lien de réinitialisation pour le moment.",
    };
  }

  return {
    success: true,
    message:
      res.data?.message ||
      "Si un compte est associé à cette adresse, vous recevrrez un lien pour réinitialiser votre mot de passe.",
  };
}

/**
 * Définit un nouveau mot de passe via l'API NestJS `/auth/reset-password`
 */
export async function resetPasswordAction(
  newPassword: string,
  recoveryAccessToken?: string | null
): Promise<AuthActionResult> {
  const res = await apiRequest<{ message?: string }>("/auth/reset-password", {
    method: "POST",
    body: { newPassword },
    tokenOverride: recoveryAccessToken || undefined,
  });

  if (!res.ok) {
    return {
      success: false,
      error:
        res.error ||
        "Votre lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",
    };
  }

  await clearSessionCookies();
  revalidatePath("/", "layout");

  return {
    success: true,
    message:
      res.data?.message ||
      "Votre mot de passe a été réinitialisé avec succès.",
  };
}

/**
 * Déconnexion utilisateur via l'API NestJS `/auth/logout` et suppression des cookies de session
 */
export async function signOutAction() {
  await apiRequest("/auth/logout", { method: "POST" }).catch(() => null);
  await clearSessionCookies();
  revalidatePath("/", "layout");
  redirect(ROUTES.HOME);
}
