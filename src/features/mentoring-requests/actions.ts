'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import {
  mentoringRequestsApi,
  CreateMentoringRequestInput,
  MentorDecisionInput,
} from '@/lib/api/requests';

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
    revalidatePath('/mentor/requests');

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

export async function decideMentoringRequestAction(
  requestId: string,
  input: MentorDecisionInput
): Promise<MentoringRequestActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté pour traiter cette demande.',
    };
  }

  try {
    const res = await mentoringRequestsApi.decideRequest(requestId, input, session.accessToken);

    revalidatePath('/mentor/requests');
    revalidatePath('/mentor/dashboard');
    revalidatePath('/mentor/journey');
    revalidatePath('/beneficiary/dashboard');
    revalidatePath('/beneficiary/journey');

    return {
      success: true,
      message:
        input.decision === 'ACCEPTED'
          ? 'La demande d’accompagnement a été acceptée avec succès. Le parcours de mentorat et la messagerie sont désormais ouverts !'
          : input.decision === 'REJECTED'
          ? 'La demande a été déclinée.'
          : 'Votre demande de précisions a été transmise au bénéficiaire.',
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors du traitement de la demande.',
    };
  }
}
