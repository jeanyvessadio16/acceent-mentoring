import { apiClient } from './client';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export const notificationsApi = {
  getMyNotifications: async (
    token: string
  ): Promise<{ items: NotificationItem[]; total: number; unreadCount: number }> => {
    return apiClient<{ items: NotificationItem[]; total: number; unreadCount: number }>(
      '/notifications',
      {
        method: 'GET',
        token,
      }
    );
  },

  markAllAsRead: async (token: string): Promise<any> => {
    return apiClient('/notifications/read-all', {
      method: 'PATCH',
      token,
    });
  },
};

