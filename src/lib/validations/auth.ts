import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L’adresse email est obligatoire.')
    .email('Veuillez fournir une adresse email valide.'),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire.')
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères.'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire.'),
  lastName: z.string().min(1, 'Le nom de famille est obligatoire.'),
  email: z.string().min(1, 'L’adresse email est obligatoire.').email('Email invalide.'),
  phone: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Le mot de passe doit comporter au minimum 8 caractères.'),
  country: z.string().min(1, 'Le pays de résidence est obligatoire.').default('Sénégal'),
  accountType: z.enum(['BENEFICIARY', 'MENTOR', 'EXPERT', 'PARTNER'], {
    message: 'Veuillez sélectionner un type de compte valide.',
  }),
  preferredLanguage: z.string().default('fr'),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'Vous devez accepter les Conditions Générales d’Utilisation.'),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, 'Vous devez consentir au traitement de vos données personnelles.'),
  marketingConsent: z.boolean().default(false),
  sexe: z.enum(['HOMME', 'FEMME']).optional(),
  milieuDeResidence: z.enum(['RURAL', 'URBAIN']).optional(),
  sdh: z.enum(['OUI', 'NON']).default('NON'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L’adresse email est obligatoire.')
    .email('Adresse email invalide.'),
});

export const resetPasswordSchema = z.object({
  accessToken: z.string().min(1, 'Le token d’accès est obligatoire.'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit comporter au moins 8 caractères.'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, 'Le code OTP doit comporter 6 chiffres.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

