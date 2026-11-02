'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens } from '@/lib/auth/session';
import { journeysApi } from '@/lib/api/journeys';

export async function toggleActionStatusAction(
  journeyId: string,
  actionId: string,
  newStatus: 'TODO' | 'DONE' | 'IN_PROGRESS'
) {
  const session = await getSessionTokens();
  if (!session.accessToken) {
    return { success: false, message: 'Non authentifié' };
  }

  try {
    await journeysApi.updateActionStatus(journeyId, actionId, newStatus, session.accessToken);
    revalidatePath('/beneficiary/journey');
    revalidatePath('/beneficiary/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur lors de la mise à jour' };
  }
}

