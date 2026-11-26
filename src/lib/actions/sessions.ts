"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";

export interface AvailabilitySlotApiItem {
  id: string;
  mentorId: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  specificDate: string | null;
  isRecurring: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface SessionParticipantRef {
  id: string;
  nom: string;
  prenom: string;
}

export interface MentorshipSessionApiItem {
  id: string;
  programId: string | null;
  mentorId: string;
  menteeId: string;
  slotId: string | null;
  titre: string;
  dateDebut: string;
  dateFin: string;
  meetingUrl: string | null;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" | string;
  createdAt?: string;
  mentor?: SessionParticipantRef | null;
  mentee?: SessionParticipantRef | null;
  program?: {
    id: string;
    titre: string;
  } | null;
}

function revalidateSessionPaths() {
  revalidatePath("/mentor/calendar");
  revalidatePath("/mentor/parcours");
  revalidatePath("/beneficiary/sessions");
  revalidatePath("/beneficiary/parcours");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/beneficiaire");
}

export async function getMySlotsAction(): Promise<{
  ok: boolean;
  data: AvailabilitySlotApiItem[];
  error?: string;
}> {
  const res = await apiRequest<AvailabilitySlotApiItem[]>("/sessions/slots/me");
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger vos créneaux.",
    };
  }
  return { ok: true, data: res.data };
}

export async function getMentorSlotsAction(mentorId: string): Promise<{
  ok: boolean;
  data: AvailabilitySlotApiItem[];
  error?: string;
}> {
  const res = await apiRequest<AvailabilitySlotApiItem[]>(
    `/sessions/slots/mentor/${mentorId}`,
    { auth: false }
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger les disponibilités du mentor.",
    };
  }
  return { ok: true, data: res.data };
}

export async function createSlotAction(payload: {
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  specificDate?: string;
  isRecurring?: boolean;
}): Promise<{ ok: boolean; data?: AvailabilitySlotApiItem; error?: string }> {
  const res = await apiRequest<AvailabilitySlotApiItem>("/sessions/slots", {
    method: "POST",
    body: payload,
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de créer ce créneau.",
    };
  }
  revalidateSessionPaths();
  return { ok: true, data: res.data };
}

export async function updateSlotAction(
  slotId: string,
  payload: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    specificDate?: string;
    isRecurring?: boolean;
    isActive?: boolean;
  }
): Promise<{ ok: boolean; data?: AvailabilitySlotApiItem; error?: string }> {
  const res = await apiRequest<AvailabilitySlotApiItem>(
    `/sessions/slots/${slotId}`,
    {
      method: "PATCH",
      body: payload,
    }
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de modifier ce créneau.",
    };
  }
  revalidateSessionPaths();
  return { ok: true, data: res.data };
}

export async function deleteSlotAction(
  slotId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/sessions/slots/${slotId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer ce créneau.",
    };
  }
  revalidateSessionPaths();
  return { ok: true };
}

export async function listSessionsAction(params?: {
  status?: string;
  upcomingOnly?: boolean;
}): Promise<{
  ok: boolean;
  data: MentorshipSessionApiItem[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  error?: string;
}> {
  const res = await apiRequest<{
    data: MentorshipSessionApiItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>("/sessions", {
    query: {
      status:
        params?.status && params.status !== "ALL" ? params.status : undefined,
      upcomingOnly: params?.upcomingOnly ? true : undefined,
      limit: 50,
    },
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger vos sessions.",
    };
  }

  return {
    ok: true,
    data: res.data.data ?? [],
    meta: res.data.meta,
  };
}

export async function bookSessionAction(payload: {
  mentorId?: string;
  menteeId?: string;
  programId?: string;
  slotId?: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  meetingUrl?: string;
  notes?: string;
}): Promise<{
  ok: boolean;
  data?: MentorshipSessionApiItem;
  error?: string;
}> {
  const res = await apiRequest<MentorshipSessionApiItem>("/sessions", {
    method: "POST",
    body: payload,
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de réserver cette session.",
    };
  }

  revalidateSessionPaths();
  return { ok: true, data: res.data };
}

export async function rescheduleSessionAction(
  sessionId: string,
  payload: {
    dateDebut: string;
    dateFin: string;
    meetingUrl?: string;
    notes?: string;
  }
): Promise<{
  ok: boolean;
  data?: MentorshipSessionApiItem;
  error?: string;
}> {
  const res = await apiRequest<MentorshipSessionApiItem>(
    `/sessions/${sessionId}/reschedule`,
    {
      method: "PATCH",
      body: payload,
    }
  );

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de reprogrammer cette session.",
    };
  }

  revalidateSessionPaths();
  return { ok: true, data: res.data };
}

export async function cancelSessionAction(
  sessionId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/sessions/${sessionId}/cancel`, {
    method: "PATCH",
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'annuler cette session.",
    };
  }

  revalidateSessionPaths();
  return { ok: true };
}

export async function completeSessionAction(
  sessionId: string,
  notes?: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/sessions/${sessionId}/complete`, {
    method: "PATCH",
    body: notes ? { notes } : {},
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de clôturer cette session.",
    };
  }

  revalidateSessionPaths();
  return { ok: true };
}

export async function submitSessionFeedbackAction(
  sessionId: string,
  payload: {
    feedback?: string;
    rating?: number;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/sessions/${sessionId}/feedback`, {
    method: "PATCH",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'enregistrer votre évaluation.",
    };
  }

  revalidateSessionPaths();
  return { ok: true };
}
