import { z } from "zod";
import { REGEX_PATTERNS } from "./auth";
import { isSafeHttpUrl } from "@/lib/utils/url-safety";

export const profileUpdateSchema = z.object({
  // Identité & Coordonnées
  firstName: z
    .string()
    .min(2, "Le prénom doit comporter au moins 2 caractères")
    .max(60, "Le prénom ne doit pas dépasser 60 caractères")
    .regex(REGEX_PATTERNS.NAME, "Le prénom contient des caractères non autorisés"),
  lastName: z
    .string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .max(60, "Le nom ne doit pas dépasser 60 caractères")
    .regex(REGEX_PATTERNS.NAME, "Le nom contient des caractères non autorisés"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-().]{8,25}$/, "Format de numéro de téléphone invalide (ex: +221 77 123 45 67)")
    .or(z.literal("")),
  photoUrl: z
    .string()
    .url("Veuillez fournir une URL d'image valide")
    .refine((v) => isSafeHttpUrl(v), "L'URL doit commencer par https:// ou http://")
    .or(z.literal(""))
    .optional(),
  pays: z.string().min(2, "Le pays est requis"),
  ville: z.string().max(100).optional().default(""),
  localisation: z.string().max(150).optional().default(""),

  // Démographie & Inclusion (Données protégées)
  age: z
    .number()
    .int("L'âge doit être un nombre entier")
    .min(15, "L'âge minimum est de 15 ans")
    .max(100, "Veuillez indiquer un âge valide")
    .nullable()
    .optional(),
  sexe: z.enum(["HOMME", "FEMME", ""]).optional(),
  milieuResidence: z.enum(["RURAL", "URBAIN", ""]).optional(),
  situationHandicap: z.boolean().default(false),

  // Parcours, Formation & Métier
  niveauEtude: z.string().max(100).optional().default(""),
  secteurActivite: z.string().max(100).optional().default(""),
  anneesExperience: z
    .number()
    .int()
    .min(0, "Les années d'expérience ne peuvent être négatives")
    .max(60, "Valeur d'expérience invalide")
    .default(0),

  // Compétences, Centres d'intérêt & Objectifs
  competences: z.array(z.string().min(1).max(50)).default([]),
  centresInteret: z.array(z.string().min(1).max(50)).default([]),
  objectifs: z.array(z.string().min(1).max(100)).default([]),
  langues: z.array(z.string().min(1).max(50)).default([]),
  disponibilite: z.string().max(150).optional().default(""),
  isPublic: z.boolean().default(true),

  // Champs spécifiques aux Mentors / Experts (optionnels)
  fonction: z.string().max(100).optional().default(""),
  organisation: z.string().max(100).optional().default(""),
  biographie: z.string().max(1000).optional().default(""),
  typesMentoring: z.enum(["INDIVIDUEL", "COLLECTIF", "LES_DEUX"]).optional().default("INDIVIDUEL"),
  linkedinUrl: z
    .string()
    .url("URL LinkedIn invalide")
    .refine((v) => isSafeHttpUrl(v), "L'URL doit commencer par https:// ou http://")
    .or(z.literal(""))
    .optional()
    .default(""),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
