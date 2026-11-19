"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export interface DiagnosticActionResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
  data?: any;
}

const API_BASE_URL = process.env.API_URL || "http://localhost:3001/api/v1";

/**
 * Server Action : Soumettre les réponses au questionnaire de diagnostic initial (F04)
 * et déclencher le moteur de matching (F05) via l'API NestJS
 */
export async function submitDiagnosticAction(
  formData: DiagnosticFormData
): Promise<DiagnosticActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Vous devez être connecté pour valider votre diagnostic.",
      };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {
        success: false,
        error: "Session expirée. Veuillez vous reconnecter.",
      };
    }

    const res = await fetch(`${API_BASE_URL}/diagnostic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(formData),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error:
          data.message ||
          "Une erreur est survenue lors de l'enregistrement de votre diagnostic.",
      };
    }

    revalidatePath("/dashboard/beneficiaire");
    revalidatePath("/diagnostic");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: data.message || "Diagnostic validé avec succès !",
      redirectUrl: data.redirectUrl || "/dashboard/beneficiaire",
      data,
    };
  } catch (err: any) {
    console.error("Erreur submitDiagnosticAction :", err);
    return {
      success: false,
      error:
        "Impossible de joindre le serveur pour le moment. Veuillez réessayer.",
    };
  }
}

/**
 * Server Action : Obtenir les recommandations de mentors calculées par le matching
 */
export async function getDiagnosticRecommendationsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return [];
    }

    const res = await fetch(`${API_BASE_URL}/diagnostic/recommendations`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("Erreur getDiagnosticRecommendationsAction :", err);
    return [];
  }
}
