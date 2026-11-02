import { apiClient } from './client';

export interface MentoringSessionItem {
  id: string;
  journeyId: string;
  mentorProfileId: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  meetingUrl?: string | null;
  summary?: string | null;
  actionPlanNotes?: string | null;
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
  journey?: {
    id: string;
    mainObjective: string;
    beneficiary?: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
        avatarPath?: string | null;
      } | null;
    };
  };
}

export const sessionsApi = {
  getMySessions: async (token: string): Promise<MentoringSessionItem[]> => {
    return apiClient<MentoringSessionItem[]>('/sessions', {
      method: 'GET',
      token,
    });
  },

  cancelSession: async (sessionId: string, reason: string, token: string): Promise<any> => {
    return apiClient(`/sessions/${sessionId}/cancel`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ reason }),
    });
  },
};

