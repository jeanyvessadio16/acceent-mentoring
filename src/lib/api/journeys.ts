import { apiClient } from './client';

export interface JourneyActionItem {
  id: string;
  objectiveId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  comment?: string | null;
  createdAt: string;
  objectiveTitle?: string;
}

export interface JourneyObjectiveItem {
  id: string;
  journeyId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  actions: JourneyActionItem[];
}

export interface JourneyResourceItem {
  id: string;
  journeyId: string;
  title: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface MentoringJourneyItem {
  id: string;
  beneficiaryId: string;
  mentorProfileId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  mainObjective: string;
  progressPercentage: number;
  startedAt: string;
  completedAt?: string | null;
  beneficiary?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarPath?: string | null;
      sector?: string | null;
    } | null;
  };
  mentorProfile?: {
    id: string;
    userId: string;
    jobTitle: string;
    organization?: string | null;
    user?: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
        avatarPath?: string | null;
      } | null;
    };
  };
  objectives: JourneyObjectiveItem[];
  sessions?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    meetingUrl?: string | null;
  }>;
  resources?: JourneyResourceItem[];
}

export const journeysApi = {
  getMyJourneys: async (token: string): Promise<MentoringJourneyItem[]> => {
    return apiClient<MentoringJourneyItem[]>('/journeys', {
      method: 'GET',
      token,
    });
  },

  getJourney: async (id: string, token: string): Promise<MentoringJourneyItem> => {
    return apiClient<MentoringJourneyItem>(`/journeys/${id}`, {
      method: 'GET',
      token,
    });
  },

  updateActionStatus: async (
    journeyId: string,
    actionId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    token: string
  ): Promise<any> => {
    return apiClient(`/journeys/${journeyId}/actions/${actionId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  },
};

