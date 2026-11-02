import { apiClient } from './client';

export interface CreateMentoringRequestInput {
  mentorProfileId: string;
  objective: string;
  problemStatement: string;
  expectedDuration: string;
  expectedFrequency: string;
  preferredFormat?: 'REMOTE' | 'IN_PERSON' | 'HYBRID';
  message: string;
}

export interface MentoringRequestItem {
  id: string;
  beneficiaryId: string;
  mentorProfileId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NEEDS_CLARIFICATION' | 'CANCELLED';
  objective: string;
  problemStatement: string;
  expectedDuration: string;
  expectedFrequency: string;
  preferredFormat: string;
  message: string;
  mentorResponse?: string | null;
  clarificationNote?: string | null;
  createdAt: string;
  mentorProfile?: {
    id: string;
    userId: string;
    jobTitle?: string | null;
    user?: {
      profile?: {
        firstName: string;
        lastName: string;
        avatarPath?: string | null;
      } | null;
    };
  };
}

export const mentoringRequestsApi = {
  createRequest: async (
    data: CreateMentoringRequestInput,
    token: string
  ): Promise<MentoringRequestItem> => {
    return apiClient<MentoringRequestItem>('/mentoring-requests', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  getMyRequests: async (token: string): Promise<MentoringRequestItem[]> => {
    return apiClient<MentoringRequestItem[]>('/mentoring-requests', {
      method: 'GET',
      token,
    });
  },

  cancelRequest: async (id: string, token: string): Promise<any> => {
    return apiClient(`/mentoring-requests/${id}/cancel`, {
      method: 'PATCH',
      token,
    });
  },
};

