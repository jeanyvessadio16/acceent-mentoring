import { apiClient } from './client';

export const masterclassesApi = {
  getAll: async (params?: { category?: string }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/masterclasses${qs}`, {
      method: 'GET',
    });
  },

  getById: async (id: string): Promise<any> => {
    return apiClient(`/masterclasses/${id}`, {
      method: 'GET',
    });
  },
};

