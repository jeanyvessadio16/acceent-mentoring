import { apiClient } from './client';

export const opportunitiesApi = {
  getAll: async (params?: { category?: string; search?: string }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/opportunities${qs}`, {
      method: 'GET',
    });
  },

  getById: async (id: string): Promise<any> => {
    return apiClient(`/opportunities/${id}`, {
      method: 'GET',
    });
  },
};

