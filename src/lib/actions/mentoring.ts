"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";

export interface MentorSearchFilter {
  search?: string;
  expertise?: string;
  secteur?: string;
  pays?: string;
  ville?: string;
  langue?: string;
  typesMentoring?: "INDIVIDUEL" | "COLLECTIF" | "LES_DEUX" | "";
  minExperience?: number;
  disponibilite?: string;
  page?: number;
  limit?: number;
}

export interface MentorSearchUserRef {
  id: string;
  nom: string;
  prenom: string;
  pays: string | null;
}

export interface MentorSearchResultItem {
  id: string;
  userId: string;
  fonction: string;
  organisation: string | null;
  anneesExperience: number;
  expertises: string[];
  secteurs: string[];
  langues: string[];
  publicsAccompagnes?: string[];
  typesMentoring: string;
  disponibilites: string | null;
  biographie: string | null;
  photoUrl: string | null;
  linkedinUrl?: string | null;
  isAvailable: boolean;
  user?: MentorSearchUserRef | null;
  nom?: string;
  prenom?: string;
  pays?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMentorshipRequestInput {
  mentorId: string;
  objectif: string;
  problematique: string;
  duree: string;
  frequence: string;
  format: string;
  message: string;
}

export interface MentorshipRequestParticipant {
  id: string;
  nom: string;
  prenom: string;
  pays?: string | null;
  email?: string;
}

export interface MentorshipRequestApiItem {
  id: string;
  menteeId: string;
  mentorId: string;
  objectif: string;
  problematique: string;
  duree: string;
  frequence: string;
  format: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | string;
  responseMessage: string | null;
  respondedAt: string | null;
  createdAt: string;
  mentor?: MentorshipRequestParticipant | null;
  mentee?: MentorshipRequestParticipant | null;
  program?: {
    id: string;
    titre: string;
    status: string;
  } | null;
}

export interface MentorshipGoalApiItem {
  id: string;
  programId: string;
  titre: string;
  description: string | null;
  indicateurs: string | null;
  echeance: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface MentorshipTaskApiItem {
  id: string;
  programId: string;
  goalId: string | null;
  titre: string;
  description: string | null;
  echeance: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  createdAt: string;
}

export interface MentorshipResourceApiItem {
  id: string;
  programId: string;
  titre: string;
  type: "DOCUMENT" | "LINK" | "VIDEO" | string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface MentorshipProgramSessionSummary {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  meetingUrl: string | null;
  status: string;
}

export interface MentorshipProgramApiItem {
  id: string;
  requestId: string;
  mentorId: string;
  menteeId: string;
  titre: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED" | string;
  progression: number;
  startDate: string;
  endDate: string | null;
  updatedAt?: string;
  mentor?: MentorshipRequestParticipant | null;
  mentee?: MentorshipRequestParticipant | null;
  _count?: {
    goals: number;
    tasks: number;
    resources: number;
    sessions: number;
  };
}

export interface MentorshipProgramDetailApiItem extends MentorshipProgramApiItem {
  goals: MentorshipGoalApiItem[];
  tasks: MentorshipTaskApiItem[];
  resources: MentorshipResourceApiItem[];
  sessions: MentorshipProgramSessionSummary[];
}

export async function searchMentorsApiAction(filter: MentorSearchFilter): Promise<{
  ok: boolean;
  data: MentorSearchResultItem[];
  meta: PaginatedMeta;
  error?: string;
}> {
  const res = await apiRequest<{
    data: MentorSearchResultItem[];
    meta: PaginatedMeta;
  }>("/mentors", {
    auth: false,
    query: {
      search: filter.search?.trim() || undefined,
      expertise: filter.expertise?.trim() || undefined,
      secteur: filter.secteur?.trim() || undefined,
      pays: filter.pays?.trim() || undefined,
      ville: filter.ville?.trim() || undefined,
      langue: filter.langue?.trim() || undefined,
      typesMentoring: filter.typesMentoring || undefined,
      minExperience:
        typeof filter.minExperience === "number" && filter.minExperience > 0
          ? filter.minExperience
          : undefined,
      disponibilite: filter.disponibilite?.trim() || undefined,
      page: Math.max(1, filter.page ?? 1),
      limit: Math.min(Math.max(1, filter.limit ?? 24), 50),
    },
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 1 },
      error: res.error ?? "Impossible de charger le catalogue des mentors.",
    };
  }

  return {
    ok: true,
    data: res.data.data ?? [],
    meta: res.data.meta ?? { total: 0, page: 1, limit: 24, totalPages: 1 },
  };
}

export async function createMentorshipRequestAction(
  input: CreateMentorshipRequestInput
): Promise<{
  ok: boolean;
  data?: MentorshipRequestApiItem;
  error?: string;
}> {
  const res = await apiRequest<MentorshipRequestApiItem>("/mentoring/requests", {
    method: "POST",
    body: input,
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'envoyer la demande de mentoring.",
    };
  }

  revalidatePath("/beneficiary/mentors");
  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/requests");
  revalidatePath("/dashboard/beneficiaire");
  revalidatePath("/dashboard/mentor");

  return { ok: true, data: res.data };
}

export async function listMentorshipRequestsAction(
  direction: "sent" | "received" | "all" = "all",
  status?: string
): Promise<{
  ok: boolean;
  data: MentorshipRequestApiItem[];
  meta: PaginatedMeta;
  error?: string;
}> {
  const res = await apiRequest<{
    data: MentorshipRequestApiItem[];
    meta: PaginatedMeta;
  }>("/mentoring/requests", {
    query: {
      direction,
      status: status && status !== "ALL" ? status : undefined,
      limit: 50,
    },
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 1 },
      error: res.error,
    };
  }

  return {
    ok: true,
    data: res.data.data ?? [],
    meta: res.data.meta ?? { total: 0, page: 1, limit: 50, totalPages: 1 },
  };
}

export async function respondMentorshipRequestAction(
  requestId: string,
  payload: {
    action: "ACCEPT" | "REJECT" | "CLARIFY";
    responseMessage?: string;
    programTitle?: string;
    programDescription?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/requests/${requestId}/respond`, {
    method: "PATCH",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de traiter cette demande.",
    };
  }

  revalidatePath("/mentor/requests");
  revalidatePath("/mentor/parcours");
  revalidatePath("/beneficiary/parcours");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/beneficiaire");

  return { ok: true };
}

export async function cancelMentorshipRequestAction(
  requestId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/requests/${requestId}/cancel`, {
    method: "PATCH",
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'annuler cette demande.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/requests");
  return { ok: true };
}

export async function listMentorshipProgramsAction(
  role: "mentor" | "mentee" | "all" = "all",
  status?: string
): Promise<{
  ok: boolean;
  data: MentorshipProgramApiItem[];
  error?: string;
}> {
  const res = await apiRequest<{
    data: MentorshipProgramApiItem[];
  }>("/mentoring/programs", {
    query: {
      role,
      status: status && status !== "ALL" ? status : undefined,
      limit: 50,
    },
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error,
    };
  }

  return { ok: true, data: res.data.data ?? [] };
}

export async function getMentorshipProgramDetailAction(
  programId: string
): Promise<{
  ok: boolean;
  data: MentorshipProgramDetailApiItem | null;
  error?: string;
}> {
  const res = await apiRequest<MentorshipProgramDetailApiItem>(
    `/mentoring/programs/${programId}`
  );

  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: null,
      error: res.error ?? "Impossible de charger le parcours.",
    };
  }

  return { ok: true, data: res.data };
}

export async function updateMentorshipProgramAction(
  programId: string,
  payload: {
    titre?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
    endDate?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/programs/${programId}`, {
    method: "PATCH",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de mettre à jour le parcours.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function createProgramGoalAction(
  programId: string,
  payload: {
    titre: string;
    description?: string;
    indicateurs?: string;
    echeance?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/programs/${programId}/goals`, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'ajouter cet objectif.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function updateProgramGoalAction(
  programId: string,
  goalId: string,
  payload: {
    titre?: string;
    description?: string;
    indicateurs?: string;
    echeance?: string;
    isCompleted?: boolean;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/mentoring/programs/${programId}/goals/${goalId}`,
    {
      method: "PATCH",
      body: payload,
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de modifier cet objectif.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function deleteProgramGoalAction(
  programId: string,
  goalId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/mentoring/programs/${programId}/goals/${goalId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer cet objectif.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function createProgramTaskAction(
  programId: string,
  payload: {
    titre: string;
    description?: string;
    goalId?: string;
    echeance?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/programs/${programId}/tasks`, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'ajouter cette action.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function updateProgramTaskAction(
  programId: string,
  taskId: string,
  payload: {
    titre?: string;
    description?: string;
    goalId?: string;
    echeance?: string;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/mentoring/programs/${programId}/tasks/${taskId}`,
    {
      method: "PATCH",
      body: payload,
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de mettre à jour cette tâche.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function deleteProgramTaskAction(
  programId: string,
  taskId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/mentoring/programs/${programId}/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer cette tâche.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function createProgramResourceAction(
  programId: string,
  payload: {
    titre: string;
    type?: "DOCUMENT" | "LINK" | "VIDEO";
    url: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/mentoring/programs/${programId}/resources`, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'ajouter cette ressource.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}

export async function deleteProgramResourceAction(
  programId: string,
  resourceId: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/mentoring/programs/${programId}/resources/${resourceId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer cette ressource.",
    };
  }

  revalidatePath("/beneficiary/parcours");
  revalidatePath("/mentor/parcours");
  return { ok: true };
}
