"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";

export interface DiagnosticFormData {
  situation: string;
  objectifPrincipal: string;
  domaine: string;
  niveau: string;
  typeAccompagnement: string;
  competences: string[];
  besoins: string[];
  secteur: string;
  contraintes?: string[];
  disponibilite: string;
  preferenceMentoring: string;
}

export interface DiagnosticRecommendation {
  mentorId: string;
  mentorProfileId: string;
  nom: string;
  prenom: string;
  email: string;
  photoUrl: string | null;
  fonction: string;
  organisation: string;
  anneesExperience: number;
  expertises: string[];
  secteurs: string[];
  scoreTotal: number;
  justification: string;
}

export interface SubmitDiagnosticResponseData {
  message?: string;
  redirectUrl?: string;
  recommendationsCount?: number;
  topRecommendations?: DiagnosticRecommendation[];
}

export interface DiagnosticActionResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
  data?: SubmitDiagnosticResponseData;
}

export interface ExistingDiagnosticRecord {
  id: string;
  situation?: string | null;
  objectifPrincipal?: string | null;
  domaine?: string | null;
  niveau?: string | null;
  typeAccompagnement?: string | null;
  competences?: string[] | null;
  besoins?: string[] | null;
  secteur?: string | null;
  contraintes?: string[] | null;
  disponibilite?: string | null;
  preferenceMentoring?: string | null;
  isCompleted?: boolean;
  updatedAt?: string;
}

/**
 * Server Action : Consulter le diagnostic actuel de l'utilisateur via `GET /diagnostic/me` (F04)
 */
export async function getMyDiagnosticAction(): Promise<ExistingDiagnosticRecord | null> {
  const res = await apiRequest<ExistingDiagnosticRecord | null>("/diagnostic/me");
  if (!res.ok || !res.data || !res.data.id) {
    return null;
  }
  return res.data;
}

/**
 * Server Action : Soumettre les réponses au questionnaire de diagnostic initial (F04)
 * et déclencher le moteur de matching (F05) via l'API NestJS
 */
export async function submitDiagnosticAction(
  formData: DiagnosticFormData
): Promise<DiagnosticActionResult> {
  const res = await apiRequest<SubmitDiagnosticResponseData>("/diagnostic", {
    method: "POST",
    body: formData,
  });

  if (!res.ok || !res.data) {
    return {
      success: false,
      error:
        res.error ||
        "Une erreur est survenue lors de l'enregistrement de votre diagnostic.",
    };
  }

  revalidatePath("/dashboard/beneficiaire");
  revalidatePath("/diagnostic");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: res.data.message || "Diagnostic validé avec succès !",
    redirectUrl: res.data.redirectUrl || "/dashboard/beneficiaire",
    data: res.data,
  };
}

/**
 * Server Action : Obtenir les recommandations de mentors calculées par le matching
 */
export async function getDiagnosticRecommendationsAction(): Promise<
  DiagnosticRecommendation[]
> {
  const res = await apiRequest<DiagnosticRecommendation[]>(
    "/diagnostic/recommendations"
  );

  if (!res.ok || !res.data) {
    return [];
  }

  return res.data;
}
