'use server';

import { revalidatePath } from 'next/cache';
import { getSessionTokens, setAuthCookies } from '@/lib/auth/session';
import { usersApi, UpdateProfileInput } from '@/lib/api/users';

export interface ProfileActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function updateProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await getSessionTokens();

  if (!session.isAuthenticated || !session.accessToken) {
    return {
      success: false,
      message: 'Vous devez être connecté pour modifier votre profil.',
    };
  }

  try {
    const rawSexe = formData.get('sexe')?.toString();
    const rawMilieu = formData.get('milieuDeResidence')?.toString();
    const rawSdh = formData.get('sdh')?.toString();

    // Traitement des listes : skills, objectives, interests
    const parseListField = (raw: FormDataEntryValue | null): string[] | undefined => {
      if (!raw) return undefined;
      const str = raw.toString().trim();
      if (!str) return undefined;
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // En cas de saisie libre séparée par des virgules
        return str
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return undefined;
    };

    const skills = parseListField(formData.get('skills'));
    const objectives = parseListField(formData.get('objectives'));
    const interests = parseListField(formData.get('interests'));

    const rawYears = formData.get('yearsOfExperience')?.toString()?.trim();
    const yearsOfExperience = rawYears && !isNaN(Number(rawYears)) ? parseInt(rawYears, 10) : undefined;

    const payload: UpdateProfileInput = {
      firstName: formData.get('firstName')?.toString().trim() || undefined,
      lastName: formData.get('lastName')?.toString().trim() || undefined,
      phone: formData.get('phone')?.toString().trim() || undefined,
      sexe: rawSexe === 'HOMME' || rawSexe === 'FEMME' ? rawSexe : undefined,
      milieuDeResidence: rawMilieu === 'URBAIN' || rawMilieu === 'RURAL' ? rawMilieu : undefined,
      sdh: rawSdh === 'OUI' || rawSdh === 'NON' ? rawSdh : undefined,
      country: formData.get('country')?.toString().trim() || undefined,
      city: formData.get('city')?.toString().trim() || undefined,
      educationLevel: formData.get('educationLevel')?.toString().trim() || undefined,
      currentTitle: formData.get('currentTitle')?.toString().trim() || undefined,
      organization: formData.get('organization')?.toString().trim() || undefined,
      sector: formData.get('sector')?.toString().trim() || undefined,
      skills: skills && skills.length > 0 ? skills : undefined,
      objectives: objectives && objectives.length > 0 ? objectives : undefined,
      interests: interests && interests.length > 0 ? interests : undefined,
      yearsOfExperience,
      bio: formData.get('bio')?.toString().trim() || undefined,
    };

    const updatedUser = await usersApi.updateMe(session.accessToken, payload);

    const newFullName = updatedUser.profile?.firstName
      ? `${updatedUser.profile.firstName} ${updatedUser.profile.lastName || ''}`.trim()
      : undefined;

    if (newFullName) {
      await setAuthCookies({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken || '',
        role: session.role || 'BENEFICIARY',
        userId: session.userId || updatedUser.id,
        userName: newFullName,
        userEmail: updatedUser.email,
      });
    }

    revalidatePath('/beneficiary/profile');
    revalidatePath('/beneficiary/dashboard');

    return {
      success: true,
      message: 'Votre profil a été mis à jour avec succès.',
      data: updatedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Une erreur est survenue lors de la mise à jour du profil.',
    };
  }
}

