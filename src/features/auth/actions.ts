'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';
import {
  setAuthCookies,
  clearAuthCookies,
  getSessionTokens,
} from '@/lib/auth/session';

export interface ActionState<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Server Action : Connexion d'un utilisateur
 */
export async function loginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get('email')?.toString().trim().toLowerCase() || '',
    password: formData.get('password')?.toString() || '',
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: 'Veuillez corriger les champs du formulaire.',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  let redirectTarget: string | null = null;

  try {
    const res = await authApi.login(validation.data);

    if (res.session?.accessToken) {
      const fullName = res.user.profile?.firstName
        ? `${res.user.profile.firstName} ${res.user.profile.lastName || ''}`.trim()
        : undefined;

      await setAuthCookies({
        accessToken: res.session.accessToken,
        refreshToken: res.session.refreshToken,
        role: res.user.role,
        userId: res.user.id,
        userName: fullName,
        userEmail: res.user.email,
        expiresAt: res.session.expiresAt,
      });

      // Redirection personnalisée ou par défaut selon le rôle
      const customRedirect = formData.get('redirectTo')?.toString();
      if (
        customRedirect &&
        customRedirect.startsWith('/') &&
        !customRedirect.startsWith('//') &&
        !customRedirect.startsWith('/login') &&
        !customRedirect.startsWith('/register') &&
        !customRedirect.startsWith('/forgot-password') &&
        !customRedirect.startsWith('/reset-password')
      ) {
        redirectTarget = customRedirect;
      } else {
        switch (res.user.role) {
          case 'ADMIN':
            redirectTarget = '/admin/dashboard';
            break;
          case 'MENTOR':
          case 'EXPERT':
            redirectTarget = '/mentor/dashboard';
            break;
          case 'BENEFICIARY':
          default:
            redirectTarget = '/beneficiary/dashboard';
            break;
        }
      }
    } else {
      return {
        success: false,
        message: 'Session non initialisée. Veuillez vérifier vos identifiants.',
      };
    }
  } catch (error: any) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: error.message || 'Identifiants invalides ou service temporairement indisponible.',
    };
  }

  if (redirectTarget) {
    revalidatePath('/', 'layout');
    redirect(redirectTarget);
  }

  return { success: true };
}

/**
 * Server Action : Inscription d'un nouvel utilisateur (F01)
 */
export async function registerAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    firstName: formData.get('firstName')?.toString().trim() || '',
    lastName: formData.get('lastName')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim().toLowerCase() || '',
    phone: formData.get('phone')?.toString().trim() || undefined,
    password: formData.get('password')?.toString() || '',
    country: formData.get('country')?.toString().trim() || 'Sénégal',
    accountType: formData.get('accountType')?.toString() || 'BENEFICIARY',
    preferredLanguage: formData.get('preferredLanguage')?.toString() || 'fr',
    termsAccepted: formData.get('termsAccepted') === 'on' || formData.get('termsAccepted') === 'true',
    privacyConsent: formData.get('privacyConsent') === 'on' || formData.get('privacyConsent') === 'true',
    marketingConsent: formData.get('marketingConsent') === 'on' || formData.get('marketingConsent') === 'true',
    sexe: (formData.get('sexe')?.toString() as 'HOMME' | 'FEMME') || undefined,
    milieuDeResidence: (formData.get('milieuDeResidence')?.toString() as 'RURAL' | 'URBAIN') || undefined,
    sdh: (formData.get('sdh')?.toString() as 'OUI' | 'NON') || 'NON',
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: 'Veuillez vérifier les informations renseignées.',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  let redirectTarget: string | null = null;

  try {
    const res = await authApi.register(validation.data);

    // Si une session directe est retournée
    if (res.session?.accessToken) {
      const fullName = res.user.profile?.firstName
        ? `${res.user.profile.firstName} ${res.user.profile.lastName || ''}`.trim()
        : undefined;

      await setAuthCookies({
        accessToken: res.session.accessToken,
        refreshToken: res.session.refreshToken,
        role: res.user.role,
        userId: res.user.id,
        userName: fullName,
        userEmail: res.user.email,
        expiresAt: res.session.expiresAt,
      });

      if (res.user.role === 'MENTOR' || res.user.role === 'EXPERT') {
        redirectTarget = '/mentor/dashboard';
      } else {
        redirectTarget = '/beneficiary/dashboard';
      }
    } else {
      // Inscription nécessitant confirmation par e-mail
      return {
        success: true,
        message: 'Votre compte a été créé avec succès ! Un lien de confirmation a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte avant de vous connecter.',
      };
    }
  } catch (error: any) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: error.message || "Une erreur est survenue lors de l'inscription.",
    };
  }

  if (redirectTarget) {
    revalidatePath('/', 'layout');
    redirect(redirectTarget);
  }

  return { success: true };
}

/**
 * Server Action : Déconnexion sécurisée (révocation de session & nettoyage des cookies)
 */
export async function logoutAction(): Promise<void> {
  try {
    const { accessToken } = await getSessionTokens();
    if (accessToken) {
      await authApi.logout(accessToken);
    }
  } catch (error) {
    console.error('Erreur lors de la révocation de session backend:', error);
  } finally {
    await clearAuthCookies();
    revalidatePath('/', 'layout');
    redirect('/login');
  }
}

/**
 * Server Action : Demande de réinitialisation de mot de passe (F01)
 */
export async function forgotPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email')?.toString().trim() || '';

  const validation = forgotPasswordSchema.safeParse({ email });
  if (!validation.success) {
    return {
      success: false,
      message: 'Veuillez fournir une adresse email valide.',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    await authApi.forgotPassword(validation.data);
    return {
      success: true,
      message: 'Si un compte correspond à cette adresse, vous recevrez un email contenant le lien de réinitialisation.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Impossible d’envoyer le lien de réinitialisation pour le moment.',
    };
  }
}

/**
 * Server Action : Réinitialisation du mot de passe avec token (F01)
 */
export async function resetPasswordAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    accessToken: formData.get('accessToken')?.toString() || '',
    newPassword: formData.get('newPassword')?.toString() || '',
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    const firstErrorMessage =
      validation.error.issues[0]?.message || 'Veuillez vérifier les informations renseignées.';
    return {
      success: false,
      message: firstErrorMessage,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    await authApi.resetPassword(validation.data);
    return {
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Lien de réinitialisation expiré ou invalide.',
    };
  }
}

/**
 * Server Action : Vérification d'un compte par code OTP (F01)
 */
export async function verifyOtpAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get('email')?.toString().trim().toLowerCase() || '',
    token: formData.get('token')?.toString().trim() || '',
  };

  if (!rawData.email || !rawData.token || rawData.token.length < 6) {
    return {
      success: false,
      message: 'Veuillez saisir votre email et le code à 6 chiffres reçu.',
    };
  }

  let redirectTarget: string | null = null;

  try {
    const res = await authApi.verifyOtp(rawData);
    if (res?.session?.accessToken) {
      await setAuthCookies({
        accessToken: res.session.accessToken,
        refreshToken: res.session.refreshToken,
        role: 'BENEFICIARY',
        userId: res.session.user?.id || '',
        expiresAt: res.session.expiresAt,
      });
      redirectTarget = '/beneficiary/dashboard';
    } else {
      return {
        success: true,
        message: 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Code de vérification invalide ou expiré.',
    };
  }

  if (redirectTarget) {
    revalidatePath('/', 'layout');
    redirect(redirectTarget);
  }

  return { success: true };
}

/**
 * Server Action : Renvoyer l'e-mail de confirmation
 */
export async function resendConfirmationAction(email: string): Promise<ActionState> {
  try {
    await authApi.resendConfirmation(email);
    return {
      success: true,
      message: 'Un nouvel email de confirmation vous a été envoyé.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Impossible de renvoyer le lien de confirmation.',
    };
  }
}

/**
 * Récupération du profil authentifié côté serveur
 */
export async function getCurrentUser() {
  const { accessToken, isAuthenticated } = await getSessionTokens();
  if (!isAuthenticated || !accessToken) {
    return null;
  }

  try {
    const user = await authApi.getMe(accessToken);
    return user;
  } catch (error) {
    // Si le token est expiré ou révoqué
    await clearAuthCookies();
    return null;
  }
}

