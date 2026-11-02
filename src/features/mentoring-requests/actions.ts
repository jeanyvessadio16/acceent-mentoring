'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import { mentoringRequestsApi, CreateMentoringRequestInput } from '@/lib/api/requests';

export interface MentoringRequestActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function createMentoringRequestAction(
  data: CreateMentoringRequestInput
): Promise<MentoringRequestActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté pour envoyer une demande de mentorat.',
    };
  }

  try {
    const created = await mentoringRequestsApi.createRequest(data, session.accessToken);

    revalidatePath('/beneficiary/dashboard');
    revalidatePath('/beneficiary/journey');
    revalidatePath('/beneficiary/mentors');

    return {
      success: true,
      message: 'Votre demande de mentoring a été envoyée avec succès au mentor.',
      data: created,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Une erreur est survenue lors de l'envoi de la demande.",
    };
  }
}

