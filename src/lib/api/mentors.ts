import { apiClient } from './client';

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
};

