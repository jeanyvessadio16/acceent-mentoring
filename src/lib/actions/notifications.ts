"use server";

import { apiRequest } from "@/lib/api/server-client";

export interface NotificationApiItem {
  id: string;
  userId: string;
  type: string;
  titre: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export async function listNotificationsAction(unreadOnly = false): Promise<{
  ok: boolean;
  data: NotificationApiItem[];
  unreadCount: number;
  error?: string;
}> {
  const res = await apiRequest<{
    data: NotificationApiItem[];
    unreadCount: number;
  }>("/notifications", {
    query: {
      unreadOnly: unreadOnly ? true : undefined,
      limit: 20,
    },
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      unreadCount: 0,
      error: res.error,
    };
  }

  return {
    ok: true,
    data: res.data.data ?? [],
    unreadCount: res.data.unreadCount ?? 0,
  };
}

export async function markNotificationReadAction(
  id: string
): Promise<{ ok: boolean }> {
  const res = await apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });
  return { ok: res.ok };
}

export async function markAllNotificationsReadAction(): Promise<{
  ok: boolean;
}> {
  const res = await apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
  return { ok: res.ok };
}

export async function deleteNotificationAction(
  id: string
): Promise<{ ok: boolean }> {
  const res = await apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
  return { ok: res.ok };
}
