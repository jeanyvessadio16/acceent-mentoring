import { apiClient } from './client';

export interface UserProfileResponse {
  id: string;
  email: string;
  phone?: string | null;
  role: 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'PARTNER' | 'ADMIN';
  status: string;
  createdAt: string;
  profile?: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    sexe?: 'HOMME' | 'FEMME' | null;
    milieuDeResidence?: 'URBAIN' | 'RURAL' | null;
    sdh?: 'NON' | 'OUI' | null;
    avatarPath?: string | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    educationLevel?: string | null;
    currentTitle?: string | null;
    organization?: string | null;
    yearsOfExperience?: number | null;
    sector?: string | null;
    skills?: string[];
    interests?: string[];
    objectives?: string[];
    languages?: string[];
    bio?: string | null;
    isCompleted?: boolean;
    createdAt?: string;
  } | null;
  mentorProfile?: any;
  expertProfile?: any;
  partnerProfile?: any;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  sexe?: 'HOMME' | 'FEMME';
  milieuDeResidence?: 'URBAIN' | 'RURAL';
  sdh?: 'NON' | 'OUI';
  phone?: string;
  country?: string;
  city?: string;
  educationLevel?: string;
  currentTitle?: string;
  organization?: string;
  yearsOfExperience?: number;
  sector?: string;
  skills?: string[];
  interests?: string[];
  objectives?: string[];
  languages?: string[];
  bio?: string;
}

export const usersApi = {
  getMe: async (token: string): Promise<UserProfileResponse> => {
    return apiClient<UserProfileResponse>('/users/me', {
      method: 'GET',
      token,
    });
  },

  updateMe: async (token: string, data: UpdateProfileInput): Promise<UserProfileResponse> => {
    return apiClient<UserProfileResponse>('/users/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },
};
