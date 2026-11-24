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

function detectAttachmentMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 5) {
    return null;
  }
  // %PDF-
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "application/pdf";
  }
  // JPEG FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // WEBP RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

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
  const detectedMime = detectAttachmentMimeFromBytes(bytes);
  if (!detectedMime) {
    return {
      ok: false,
      error: "Contenu du fichier invalide. Formats acceptés : PDF, JPG, PNG ou WEBP.",
    };
  }

  const base64Data = Buffer.from(bytes).toString("base64");

  const res = await apiRequest<UploadedAttachmentPayload>(
    `/conversations/${encodeURIComponent(conversationId)}/attachments`,
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
