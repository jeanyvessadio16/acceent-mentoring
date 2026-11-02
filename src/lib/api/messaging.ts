import { apiClient } from './client';

export interface ConversationParticipantItem {
  id: string;
  conversationId: string;
  userId: string;
  user: {
    id: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarPath?: string | null;
    } | null;
  };
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarPath?: string | null;
    } | null;
  };
}

export interface ConversationItem {
  id: string;
  updatedAt: string;
  participants: ConversationParticipantItem[];
  messages: MessageItem[];
}

export const messagingApi = {
  getMyConversations: async (token: string): Promise<ConversationItem[]> => {
    return apiClient<ConversationItem[]>('/conversations', {
      method: 'GET',
      token,
    });
  },

  getMessages: async (
    conversationId: string,
    token: string
  ): Promise<{ items: MessageItem[]; total: number }> => {
    return apiClient<{ items: MessageItem[]; total: number }>(`/conversations/${conversationId}/messages`, {
      method: 'GET',
      token,
    });
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    token: string
  ): Promise<MessageItem> => {
    return apiClient<MessageItem>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  },
};

