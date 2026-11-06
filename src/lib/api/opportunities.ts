import { apiClient } from './client';

export type OpportunityCategory =
  | 'EMPLOYMENT'
  | 'INTERNSHIP'
  | 'TRAINING'
  | 'COMPETITION'
  | 'SCHOLARSHIP'
  | 'FUNDING'
  | 'CALL_FOR_PROJECTS'
  | 'EVENT';

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  country?: string | null;
  city?: string | null;
  externalUrl: string;
  expiresAt: string;
  isActive: boolean;
  publishedById: string;
  createdAt: string;
  updatedAt: string;
  publisher?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  };
  _count?: {
    favorites: number;
  };
}

export interface CreateOpportunityInput {
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  country?: string;
  city?: string;
  externalUrl: string;
  expiresAt: string;
}

export const opportunitiesApi = {
  getAll: async (params?: { category?: string; search?: string }): Promise<{ items: OpportunityItem[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient<{ items: OpportunityItem[]; total: number }>(`/opportunities${qs}`, {
      method: 'GET',
    }).catch(() => ({ items: [], total: 0 }));
  },

  getById: async (id: string): Promise<OpportunityItem> => {
    return apiClient<OpportunityItem>(`/opportunities/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: CreateOpportunityInput, token: string): Promise<OpportunityItem> => {
    return apiClient<OpportunityItem>('/opportunities', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },
};
