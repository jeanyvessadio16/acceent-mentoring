import { apiClient } from './client';

export interface EligibilityResponse {
  canStartDiagnostic: boolean;
  isProfileComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  message: string;
}

export interface CreateDiagnosticInput {
  currentSituation: string;
  mainObjective: string;
  domain: string;
  level: string;
  skills: string[];
  needs: string[];
  sector: string;
  experienceSummary?: string;
  constraints?: string[];
  availability: string;
  preferredMentoringType:
    | 'INDIVIDUAL'
    | 'COLLECTIVE'
    | 'COACHING'
    | 'EXPERTISE'
    | 'ORIENTATION'
    | 'ENTREPRENEURSHIP'
    | 'DIGITAL_AI';
  preferredFormat?: 'REMOTE' | 'IN_PERSON' | 'HYBRID';
  preferredLanguages?: string[];
  rawQuestionnaire?: unknown;
}

export interface DiagnosticItem {
  id: string;
  beneficiaryId: string;
  currentSituation: string;
  mainObjective: string;
  domain: string;
  level: string;
  skills: string[];
  needs: string[];
  sector: string;
  experienceSummary?: string | null;
  constraints: string[];
  availability: string;
  preferredMentoringType: string;
  preferredFormat: string;
  preferredLanguages: string[];
  recommendationsSummary?: any;
  isCurrent: boolean;
  createdAt: string;
}

export interface CreateDiagnosticResponse {
  diagnostic: DiagnosticItem;
  needProfile: any;
}

export const diagnosticsApi = {
  checkEligibility: async (token: string): Promise<EligibilityResponse> => {
    return apiClient<EligibilityResponse>('/diagnostics/eligibility', {
      method: 'GET',
      token,
    });
  },

  createDiagnostic: async (
    token: string,
    data: CreateDiagnosticInput
  ): Promise<CreateDiagnosticResponse> => {
    return apiClient<CreateDiagnosticResponse>('/diagnostics', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  getCurrentDiagnostic: async (token: string): Promise<DiagnosticItem | null> => {
    return apiClient<DiagnosticItem>('/diagnostics/me/current', {
      method: 'GET',
      token,
    }).catch(() => null);
  },

  getDiagnosticHistory: async (token: string): Promise<DiagnosticItem[]> => {
    return apiClient<DiagnosticItem[]>('/diagnostics/me/history', {
      method: 'GET',
      token,
    }).catch(() => []);
  },
};

