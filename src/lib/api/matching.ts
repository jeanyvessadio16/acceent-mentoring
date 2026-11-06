import { apiClient } from './client';

export interface MatchingResultItem {
  id: string;
  diagnosticId: string;
  mentorProfileId: string;
  totalScore: number;
  scoreBreakdown: {
    expertiseScore: number;
    objectiveScore: number;
    sectorScore: number;
    availabilityScore: number;
    languageScore: number;
    formatScore: number;
  };
  justification: string;
  createdAt: string;
  mentorProfile?: {
    id: string;
    userId: string;
    jobTitle?: string;
    organization?: string;
    yearsOfExperience?: number;
    sectors: string[];
    expertises: string[];
    languages?: string[];
    mentoringTypes?: string[];
    mentoringFormats?: string[];
    biography?: string;
    averageRating: number;
    totalReviews: number;
    user?: {
      email: string;
      profile?: {
        firstName: string;
        lastName: string;
        avatarPath?: string | null;
        city?: string | null;
        country?: string | null;
      };
    };
  };
}

export interface MatchingRecommendationsResponse {
  items: MatchingResultItem[];
  total: number;
  page?: number;
  limit?: number;
}

export const matchingApi = {
  compute: async (token: string): Promise<any> => {
    return apiClient('/matching/compute', {
      method: 'POST',
      token,
    });
  },

  getRecommendations: async (
    token: string,
    params?: { limit?: number; minScore?: number; sector?: string }
  ): Promise<MatchingRecommendationsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.minScore) searchParams.set('minScore', String(params.minScore));
    if (params?.sector) searchParams.set('sector', params.sector);

    const query = searchParams.toString();
    const endpoint = `/matching/recommendations${query ? `?${query}` : ''}`;

    return apiClient<MatchingRecommendationsResponse>(endpoint, {
      method: 'GET',
      token,
    }).catch(() => ({ items: [], total: 0 }));
  },
};

