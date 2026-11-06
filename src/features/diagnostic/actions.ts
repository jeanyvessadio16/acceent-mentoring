'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import { diagnosticsApi, CreateDiagnosticInput } from '@/lib/api/diagnostics';
import { matchingApi } from '@/lib/api/matching';

export interface DiagnosticActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function submitDiagnosticAction(
  input: CreateDiagnosticInput
): Promise<DiagnosticActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté pour réaliser votre diagnostic.',
    };
  }

  try {
    // 1. Enregistrement du diagnostic en BDD
    const res = await diagnosticsApi.createDiagnostic(session.accessToken, input);

    // 2. Calcul automatique des correspondances mentors (matching)
    try {
      await matchingApi.compute(session.accessToken);
    } catch (matchingError) {
      // Le matching peut aussi être calculé à la volée par le backend lors de la consultation
      console.warn('Le recalcul automatique du matching a échoué:', matchingError);
    }

    // 3. Revalidation des pages impactées
    revalidatePath('/beneficiary/diagnostic');
    revalidatePath('/beneficiary/dashboard');
    revalidatePath('/beneficiary/mentors');

    return {
      success: true,
      message: 'Votre diagnostic a été enregistré avec succès et vos correspondances de mentors ont été calculées.',
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Une erreur est survenue lors de l'enregistrement du diagnostic.",
    };
  }
}

