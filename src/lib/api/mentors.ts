import { apiClient } from './client';

export interface UpsertMentorProfileInput {
  jobTitle: string;
  organization: string;
  yearsOfExperience: number;
  expertises: string[];
  sectors: string[];
  languages?: string[];
  targetAudiences?: string[];
  mentoringTypes?: string[];
  mentoringFormats?: string[];
  biography: string;
  careerHistory?: string;
  linkedinUrl?: string;
}

export const mentorsApi = {
  searchMentors: async (params?: { search?: string; sector?: string }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sector) query.set('sector', params.sector);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/mentors${qs}`, {
      method: 'GET',
    });
  },

  getMentorById: async (id: string): Promise<any> => {
    return apiClient(`/mentors/${id}`, {
      method: 'GET',
    });
  },

  getMyProfile: async (token: string): Promise<any> => {
    return apiClient('/mentors/me/profile', {
      method: 'GET',
      token,
    });
  },

  upsertMyProfile: async (data: UpsertMentorProfileInput, token: string): Promise<any> => {
    return apiClient('/mentors/me/profile', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  updateAvailabilityStatus: async (isAvailable: boolean, token: string): Promise<any> => {
    return apiClient('/mentors/me/availability-status', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isAvailable }),
    });
  },
};
