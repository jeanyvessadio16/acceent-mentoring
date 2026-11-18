import { z } from 'zod';

/**
 * Expressions régulières (Regex) pour le contrôle strict des contraintes
 */
export const REGEX_PATTERNS = {
  // Email conforme : local-part, @, domaine, extension de 2+ caractères
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Prénom et Nom : lettres avec accents (français, wolof, etc.), apostrophe, tiret et espace
  NAME: /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s'-]{2,60}$/,

  // Numéro de téléphone international / local (ex: +221 77 123 45 67, +33 6 12 34 56 78, 771234567)
  PHONE: /^\+?[1-9]\d{0,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,

  // Pays de résidence : lettres, accents, tiret et espaces
  COUNTRY: /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s'-]{2,50}$/,

  // Contraintes de complexité du mot de passe
  PASSWORD_UPPERCASE: /[A-Z]/,
  PASSWORD_LOWERCASE: /[a-z]/,
  PASSWORD_NUMBER: /[0-9]/,
  PASSWORD_SPECIAL: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/,
};

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est obligatoire')
    .regex(REGEX_PATTERNS.EMAIL, 'Veuillez renseigner une adresse email valide (ex: utilisateur@domaine.com)'),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    accountType: z.enum(['beneficiary', 'mentor', 'expert', 'partner'], {
      message: 'Veuillez sélectionner un type de compte',
    }),
    firstName: z
      .string()
      .min(2, 'Le prénom doit comporter au moins 2 caractères')
      .max(60, 'Le prénom ne doit pas dépasser 60 caractères')
      .regex(REGEX_PATTERNS.NAME, 'Le prénom ne doit contenir que des lettres, espaces, tirets ou apostrophes'),
    lastName: z
      .string()
      .min(2, 'Le nom doit comporter au moins 2 caractères')
      .max(60, 'Le nom ne doit pas dépasser 60 caractères')
      .regex(REGEX_PATTERNS.NAME, 'Le nom ne doit contenir que des lettres, espaces, tirets ou apostrophes'),
    age: z
      .number({
        message: 'L\'âge est obligatoire',
      })
      .int('L\'âge doit être un nombre entier')
      .min(15, 'L\'âge minimum requis est de 15 ans')
      .max(100, 'Veuillez renseigner un âge valide (maximum 100 ans)'),
    sexe: z.enum(['Femme', 'Homme'], {
      message: 'Veuillez sélectionner votre sexe (Femme ou Homme)',
    }),
    milieuResidence: z.enum(['Rural', 'Urbain'], {
      message: 'Veuillez sélectionner votre milieu de résidence (Rural ou Urbain)',
    }),
    sdh: z.enum(['Oui', 'Non'], {
      message: 'Veuillez indiquer si vous êtes en Situation de Handicap - SDH (Oui ou Non)',
    }),
    email: z
      .string()
      .min(1, 'L\'adresse email est obligatoire')
      .regex(REGEX_PATTERNS.EMAIL, 'Veuillez renseigner une adresse email valide (ex: utilisateur@domaine.com)'),
    phone: z
      .string()
      .min(8, 'Le numéro de téléphone doit comporter au moins 8 chiffres')
      .regex(REGEX_PATTERNS.PHONE, 'Format de numéro de téléphone invalide (ex: +221 77 123 45 67)'),
    country: z
      .string()
      .min(1, 'Le pays est requis')
      .regex(REGEX_PATTERNS.COUNTRY, 'Le nom du pays ne doit contenir que des lettres'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
      .regex(REGEX_PATTERNS.PASSWORD_UPPERCASE, 'Le mot de passe doit inclure au moins une lettre majuscule')
      .regex(REGEX_PATTERNS.PASSWORD_LOWERCASE, 'Le mot de passe doit inclure au moins une lettre minuscule')
      .regex(REGEX_PATTERNS.PASSWORD_NUMBER, 'Le mot de passe doit inclure au moins un chiffre')
      .regex(REGEX_PATTERNS.PASSWORD_SPECIAL, 'Le mot de passe doit inclure au moins un caractère spécial (!@#$%...)'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est obligatoire'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les Conditions Générales d\'Utilisation pour continuer',
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: 'Vous devez consentir au traitement de vos données personnelles',
    }),
    newsletter: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est obligatoire')
    .regex(REGEX_PATTERNS.EMAIL, 'Veuillez renseigner une adresse email valide (ex: utilisateur@domaine.com)'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
