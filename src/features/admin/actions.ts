'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import {
  adminApi,
  MatchingWeights,
} from '@/lib/api/admin';
import { opportunitiesApi, CreateOpportunityInput } from '@/lib/api/opportunities';

export async function validateMentorAction(
  mentorProfileId: string,
  validationStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  reason?: string
) {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté en tant qu’administrateur.',
    };
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'Action réservée aux administrateurs.',
    };
  }

  try {
    const updated = await adminApi.updateMentorValidation(
      mentorProfileId,
      validationStatus,
      session.accessToken,
      reason
    );

    revalidatePath('/admin/mentors-validation');
    revalidatePath('/admin/dashboard');
    revalidatePath('/beneficiary/mentors');

    return {
      success: true,
      message:
        validationStatus === 'APPROVED'
          ? 'La candidature mentor a été approuvée et publiée avec succès sur l’annuaire public.'
          : validationStatus === 'REJECTED'
          ? 'La candidature a été refusée.'
          : 'Le statut du profil mentor a été mis à jour.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la validation du mentor.',
    };
  }
}

export async function updateUserStatusAction(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED',
  reason?: string
) {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté en tant qu’administrateur.',
    };
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'Action réservée aux administrateurs.',
    };
  }

  try {
    const updated = await adminApi.updateUserStatus(
      userId,
      status,
      session.accessToken,
      reason
    );

    revalidatePath('/admin/users');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message:
        status === 'ACTIVE'
          ? 'Le compte utilisateur a été réactivé avec succès.'
          : 'Le compte utilisateur a été suspendu.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la mise à jour du statut utilisateur.',
    };
  }
}

export async function createOpportunityAction(data: CreateOpportunityInput) {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté pour publier une opportunité.',
    };
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'PARTNER') {
    return {
      success: false,
      message: 'Action réservée aux administrateurs et partenaires.',
    };
  }

  try {
    const created = await opportunitiesApi.create(data, session.accessToken);

    revalidatePath('/admin/opportunities');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/statistics');
    revalidatePath('/opportunities');

    return {
      success: true,
      message: 'Opportunité créée et publiée avec succès.',
      data: created,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la création de l’opportunité.',
    };
  }
}

export async function updateMatchingWeightsAction(weights: MatchingWeights) {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté en tant qu’administrateur.',
    };
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'Action réservée aux administrateurs.',
    };
  }

  try {
    const updated = await adminApi.updateMatchingWeights(weights, session.accessToken);

    revalidatePath('/admin/settings');
    revalidatePath('/beneficiary/diagnostic');
    revalidatePath('/beneficiary/mentors');

    return {
      success: true,
      message: 'Les pondérations du moteur de matching ont été mises à jour avec succès.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la mise à jour des pondérations.',
    };
  }
}

export async function createMentoringProgramAction(data: {
  title: string;
  description: string;
  targetAudience: string;
  territory?: string;
  startDate?: string;
  endDate?: string;
  targetBeneficiaries: number;
}) {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté en tant qu’administrateur.',
    };
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'Action réservée aux administrateurs.',
    };
  }

  try {
    const created = await adminApi.createProgram(data, session.accessToken);

    revalidatePath('/admin/settings');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: 'Le programme de mentoring a été créé avec succès.',
      data: created,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Erreur lors de la création du programme.',
    };
  }
}
