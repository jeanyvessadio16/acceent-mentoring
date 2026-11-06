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
  beneficiary?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarPath?: string | null;
      sector?: string | null;
      city?: string | null;
      country?: string | null;
      phone?: string | null;
      bio?: string | null;
      currentTitle?: string | null;
      organization?: string | null;
      educationLevel?: string | null;
    } | null;
  };
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
  journey?: {
    id: string;
    status: string;
    progressPercentage: number;
  } | null;
}

export interface MentorDecisionInput {
  decision: 'ACCEPTED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
  mentorResponse?: string;
  clarificationNote?: string;
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

  getMyRequests: async (
    token: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<any>(`/mentoring-requests${qs}`, {
      method: 'GET',
      token,
    });
  },

  decideRequest: async (
    id: string,
    data: MentorDecisionInput,
    token: string
  ): Promise<any> => {
    return apiClient(`/mentoring-requests/${id}/decision`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  cancelRequest: async (id: string, token: string): Promise<any> => {
    return apiClient(`/mentoring-requests/${id}/cancel`, {
      method: 'PATCH',
      token,
    });
  },
};

