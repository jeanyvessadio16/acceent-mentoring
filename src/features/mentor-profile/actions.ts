'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import { mentorsApi, UpsertMentorProfileInput } from '@/lib/api/mentors';

export interface MentorProfileActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function upsertMentorProfileAction(
  input: UpsertMentorProfileInput
): Promise<MentorProfileActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté en tant que mentor pour modifier votre profil.',
    };
  }

  try {
    const updated = await mentorsApi.upsertMyProfile(input, session.accessToken);

    revalidatePath('/mentor/profile');
    revalidatePath('/mentor/dashboard');
    revalidatePath('/beneficiary/mentors');

    return {
      success: true,
      message: 'Votre profil mentor a été mis à jour avec succès.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la mise à jour du profil mentor.',
    };
  }
}

export async function toggleMentorAvailabilityAction(
  isAvailable: boolean
): Promise<MentorProfileActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté.',
    };
  }

  try {
    await mentorsApi.updateAvailabilityStatus(isAvailable, session.accessToken);

    revalidatePath('/mentor/profile');
    revalidatePath('/mentor/dashboard');

    return {
      success: true,
      message: isAvailable
        ? 'Votre disponibilité est maintenant active. Vous pouvez recevoir des demandes de mentorat.'
        : 'Votre disponibilité a été suspendue temporairement.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors du changement de disponibilité.',
    };
  }
}

