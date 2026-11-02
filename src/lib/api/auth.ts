import { apiClient } from './client';
import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validations/auth';

export interface AuthSessionResponse {
  user: {
    id: string;
    email: string;
    role: 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'PARTNER' | 'ADMIN';
    status: string;
    requiresAdminValidation?: boolean;
    profile: {
      id?: string;
      firstName: string;
      lastName: string;
      phone?: string;
      country?: string;
      city?: string;
      languages?: string[];
      avatarUrl?: string;
    };
    mentorValidationStatus?: string | null;
    expertValidationStatus?: string | null;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
  } | null;
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthSessionResponse> => {
    return apiClient<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: async (data: RegisterInput): Promise<AuthSessionResponse> => {
    return apiClient<AuthSessionResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async (token: string): Promise<any> => {
    return apiClient('/auth/me', {
      method: 'GET',
      token,
    });
  },

  logout: async (token?: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
      token,
    });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt?: number }> => {
    return apiClient('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<{ message: string }> => {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: ResetPasswordInput): Promise<{ message: string }> => {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOtp: async (data: { email: string; token: string }): Promise<any> => {
    return apiClient('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resendConfirmation: async (email: string): Promise<{ message: string }> => {
    return apiClient('/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

