"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";

export interface ConversationParticipant {
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface MessageAttachmentApiItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface ChatMessageApiItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: {
    id: string;
    nom: string;
    prenom: string;
  } | null;
  attachments?: MessageAttachmentApiItem[];
}

export interface ConversationApiItem {
  id: string;
  lastMessageAt: string | null;
  createdAt: string;
  otherParticipant: ConversationParticipant;
  lastMessage: ChatMessageApiItem | null;
  unreadCount: number;
}

export async function listConversationsAction(): Promise<{
  ok: boolean;
  data: ConversationApiItem[];
  error?: string;
}> {
  const res = await apiRequest<ConversationApiItem[]>("/conversations");
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger vos conversations.",
    };
  }
  return { ok: true, data: res.data };
}

export async function startConversationAction(recipientId: string): Promise<{
  ok: boolean;
  data?: { id: string };
  error?: string;
}> {
  const res = await apiRequest<{ id: string }>("/conversations", {
    method: "POST",
    body: { recipientId },
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error:
        res.error ?? "Impossible de démarrer la conversation avec ce contact.",
    };
  }
  revalidatePath("/beneficiary/messages");
  revalidatePath("/mentor/messages");
  return { ok: true, data: res.data };
}

export async function getConversationMessagesAction(
  conversationId: string,
  page = 1
): Promise<{
  ok: boolean;
  data: ChatMessageApiItem[];
  error?: string;
}> {
  const res = await apiRequest<{ data: ChatMessageApiItem[] }>(
    `/conversations/${conversationId}/messages`,
    { query: { page, limit: 50 } }
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger les messages.",
    };
  }
  return { ok: true, data: res.data.data ?? [] };
}

export interface UploadedAttachmentPayload {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadMessageAttachmentAction(
  conversationId: string,
  formData: FormData
): Promise<{
  ok: boolean;
  data?: UploadedAttachmentPayload;
  error?: string;
}> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Aucun fichier sélectionné." };
  }

  if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      error: "La pièce jointe doit être comprise entre 1 octet et 5 Mo.",
    };
  }

  if (file.type && !ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Formats acceptés : PDF, JPG, PNG ou WEBP.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const base64Data = Buffer.from(bytes).toString("base64");

  const res = await apiRequest<UploadedAttachmentPayload>(
    `/conversations/${conversationId}/attachments`,
    {
      method: "POST",
      body: {
        fileName: file.name,
        base64Data,
      },
    }
  );

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de téléverser cette pièce jointe.",
    };
  }

  return { ok: true, data: res.data };
}

export async function sendConversationMessageAction(
  conversationId: string,
  content: string,
  attachments?: UploadedAttachmentPayload[]
): Promise<{
  ok: boolean;
  data?: ChatMessageApiItem;
  error?: string;
}> {
  const res = await apiRequest<ChatMessageApiItem>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: {
        content,
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      },
    }
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'envoyer le message.",
    };
  }
  revalidatePath("/beneficiary/messages");
  revalidatePath("/mentor/messages");
  return { ok: true, data: res.data };
}

export async function markConversationReadAction(
  conversationId: string
): Promise<{ ok: boolean }> {
  const res = await apiRequest(`/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
  return { ok: res.ok };
}
