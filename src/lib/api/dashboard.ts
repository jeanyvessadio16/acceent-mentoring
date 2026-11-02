import { apiClient } from './client';
import { BeneficiaryDashboardData } from '@/types';

export const dashboardApi = {
  getBeneficiaryDashboard: async (token: string): Promise<BeneficiaryDashboardData> => {
    return apiClient<BeneficiaryDashboardData>('/dashboards/beneficiary', {
      method: 'GET',
      token,
    });
  },

  getMentorDashboard: async (token: string): Promise<any> => {
    return apiClient('/dashboards/mentor', {
      method: 'GET',
      token,
    });
  },
};

