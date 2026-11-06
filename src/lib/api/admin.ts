import { apiClient } from './client';

export interface AdminDashboardData {
  activeUsers: number;
  newRegistrationsLast30Days: number;
  activeMentors: number;
  pendingMentorValidations: number;
  totalMentoringRequests: number;
  totalSessions: number;
  averageSatisfaction: number;
  activePrograms: number;
  openModerationReports: number;
}

export interface MentorCandidateItem {
  id: string;
  userId: string;
  jobTitle: string;
  organization: string;
  yearsOfExperience: number;
  expertises: string[];
  sectors: string[];
  languages: string[];
  biography: string;
  cvUrl?: string | null;
  linkedinUrl?: string | null;
  validationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  validatedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    status: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarPath?: string | null;
      city?: string | null;
      country?: string | null;
      phone?: string | null;
    } | null;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'ADMIN' | 'SUPER_ADMIN' | 'PARTNER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DELETED';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    city?: string | null;
    country?: string | null;
    avatarPath?: string | null;
  } | null;
  mentorProfile?: {
    id: string;
    validationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    isAvailable: boolean;
  } | null;
  expertProfile?: {
    id: string;
    validationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    isAvailable: boolean;
  } | null;
}

export interface MatchingWeights {
  expertiseWeight: number;
  objectiveWeight: number;
  sectorWeight: number;
  availabilityWeight: number;
  languageWeight: number;
  formatWeight: number;
}

export interface MentoringProgramItem {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  territory: string;
  startDate?: string | null;
  endDate?: string | null;
  targetBeneficiaries: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    journeys: number;
  };
}

export interface ImpactKpiReport {
  generatedAt: string;
  totalRegisteredUsers: number;
  completedProfiles: number;
  approvedMentors: number;
  totalMatches: number;
  totalSessions: number;
  journeyCompletionRatePercentage: number;
  averageSatisfactionScore: number;
  totalMasterclasses: number;
  totalOpportunities: number;
  employmentOutcomes: number;
  businessCreationOutcomes: number;
  demographics: {
    sexe: {
      homme: number;
      femme: number;
    };
    milieuDeResidence: {
      urbain: number;
      rural: number;
    };
    sdh: {
      oui: number;
      non: number;
    };
  };
}

export const adminApi = {
  getDashboard: async (token: string): Promise<AdminDashboardData> => {
    return apiClient<AdminDashboardData>('/admin/dashboard', {
      method: 'GET',
      token,
    });
  },

  listMentors: async (
    token: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<{ items: MentorCandidateItem[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    try {
      const res = await apiClient<any>(`/admin/mentors${qs}`, {
        method: 'GET',
        token,
      });
      const items: MentorCandidateItem[] = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];
      const total: number =
        typeof res?.meta?.total === 'number'
          ? res.meta.total
          : typeof res?.total === 'number'
          ? res.total
          : items.length;
      return { items, total };
    } catch (err) {
      console.error('Erreur récupération mentors admin:', err);
      return { items: [], total: 0 };
    }
  },

  updateMentorValidation: async (
    id: string,
    validationStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    token: string,
    reason?: string
  ): Promise<any> => {
    return apiClient(`/admin/mentors/${id}/validation`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ validationStatus, reason }),
    });
  },

  listUsers: async (
    token: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: AdminUserItem[]; total: number; page: number; limit: number; totalPages: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    try {
      const res = await apiClient<any>(`/admin/users${qs}`, {
        method: 'GET',
        token,
      });

      const items: AdminUserItem[] = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];
      const total: number =
        typeof res?.meta?.total === 'number'
          ? res.meta.total
          : typeof res?.total === 'number'
          ? res.total
          : items.length;
      const page: number = res?.meta?.page ?? res?.page ?? 1;
      const limit: number = res?.meta?.limit ?? res?.limit ?? 50;
      const totalPages: number = res?.meta?.totalPages ?? res?.totalPages ?? 1;

      return { items, total, page, limit, totalPages };
    } catch (err) {
      console.error('Erreur récupération utilisateurs admin:', err);
      return { items: [], total: 0, page: 1, limit: 50, totalPages: 1 };
    }
  },

  updateUserStatus: async (
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED',
    token: string,
    reason?: string
  ): Promise<any> => {
    return apiClient(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status, reason }),
    });
  },

  getMatchingWeights: async (token: string): Promise<MatchingWeights> => {
    return apiClient<MatchingWeights>('/admin/matching-weights', {
      method: 'GET',
      token,
    });
  },

  updateMatchingWeights: async (
    weights: MatchingWeights,
    token: string
  ): Promise<MatchingWeights> => {
    return apiClient<MatchingWeights>('/admin/matching-weights', {
      method: 'PUT',
      token,
      body: JSON.stringify(weights),
    });
  },

  listPrograms: async (token: string): Promise<MentoringProgramItem[]> => {
    return apiClient<MentoringProgramItem[]>('/admin/programs', {
      method: 'GET',
      token,
    }).catch(() => []);
  },

  createProgram: async (
    data: {
      title: string;
      description: string;
      targetAudience: string;
      territory?: string;
      startDate?: string;
      endDate?: string;
      targetBeneficiaries: number;
    },
    token: string
  ): Promise<MentoringProgramItem> => {
    return apiClient<MentoringProgramItem>('/admin/programs', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  getImpactStatistics: async (token: string): Promise<ImpactKpiReport> => {
    return apiClient<ImpactKpiReport>('/statistics/impact', {
      method: 'GET',
      token,
    });
  },
};
