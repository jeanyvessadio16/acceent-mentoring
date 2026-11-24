"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/server-client";

export type MasterclassStatusValue =
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface MasterclassApiItem {
  id: string;
  titre: string;
  intervenant: string;
  description: string;
  categorie: string;
  dateSession: string;
  duree: number;
  lienLive?: string | null;
  lienReplay?: string | null;
  statut: MasterclassStatusValue | string;
  maxParticipants: number | null;
  _count?: { registrations: number };
}

export interface MasterclassRegistrationApiItem {
  id: string;
  masterclassId: string;
  userId: string;
  attended: boolean;
  registeredAt: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  masterclass?: MasterclassApiItem;
}

export type OpportunityCategoryValue =
  | "EMPLOI"
  | "STAGE"
  | "FORMATION"
  | "CONCOURS"
  | "BOURSE"
  | "FINANCEMENT"
  | "APPEL_PROJETS"
  | "EVENEMENT";

export type OpportunityStatusValue = "ACTIVE" | "EXPIRED" | "ARCHIVED";

export interface OpportunityApiItem {
  id: string;
  titre: string;
  organisation: string;
  categorie: OpportunityCategoryValue | string;
  description: string;
  localisation: string | null;
  typeContrat: string | null;
  lienCandidature: string;
  dateExpiration: string;
  status: OpportunityStatusValue | string;
  createdAt?: string;
}

export interface OpportunityFavoriteApiItem {
  id: string;
  opportunityId: string;
  userId: string;
  opportunity?: OpportunityApiItem;
}

export type ReportStatusValue =
  | "PENDING"
  | "REVIEWED"
  | "RESOLVED"
  | "DISMISSED";

export interface ReportApiItem {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  targetType: string;
  targetId: string;
  motif: string;
  status: ReportStatusValue | string;
  adminNotes: string | null;
  createdAt: string;
  reporter?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  reportedUser?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

export interface MatchingWeightsApiData {
  id?: string;
  expertiseWeight: number;
  objectiveWeight: number;
  sectorWeight: number;
  availabilityWeight: number;
  languageWeight: number;
  formatWeight: number;
  isDefault?: boolean;
}

function revalidateCatalogPaths() {
  revalidatePath("/beneficiary/masterclasses");
  revalidatePath("/admin/masterclasses");
  revalidatePath("/expert/masterclasses");
  revalidatePath("/masterclasses");
  revalidatePath("/beneficiary/opportunities");
  revalidatePath("/admin/opportunities");
  revalidatePath("/partenaire/opportunities");
  revalidatePath("/opportunities");
  revalidatePath("/admin/moderation");
}

// ================================
// MASTERCLASSES (F11)
// ================================

export async function listMasterclassesAction(filter?: {
  categorie?: string;
  statut?: string;
  search?: string;
}): Promise<{ ok: boolean; data: MasterclassApiItem[]; error?: string }> {
  const res = await apiRequest<{ data: MasterclassApiItem[] }>(
    "/masterclasses",
    {
      auth: false,
      query: {
        categorie: filter?.categorie?.trim() || undefined,
        statut:
          filter?.statut && filter.statut !== "ALL"
            ? filter.statut
            : undefined,
        search: filter?.search?.trim() || undefined,
        limit: 50,
      },
    }
  );

  if (!res.ok || !res.data) {
    return { ok: false, data: [], error: res.error };
  }
  return { ok: true, data: res.data.data ?? [] };
}

export async function getMyMasterclassRegistrationsAction(): Promise<{
  ok: boolean;
  data: MasterclassRegistrationApiItem[];
}> {
  const res = await apiRequest<MasterclassRegistrationApiItem[]>(
    "/masterclasses/me/registrations"
  );
  if (!res.ok || !res.data) {
    return { ok: false, data: [] };
  }
  return { ok: true, data: res.data };
}

export async function registerMasterclassAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/masterclasses/${id}/register`, {
    method: "POST",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de vous inscrire à cette masterclass.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

export async function unregisterMasterclassAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/masterclasses/${id}/register`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'annuler votre inscription.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

export async function getMasterclassAccessAction(id: string): Promise<{
  ok: boolean;
  data?: {
    id: string;
    titre: string;
    statut: string;
    lienLive: string | null;
    lienReplay: string | null;
  };
  error?: string;
}> {
  const res = await apiRequest<{
    id: string;
    titre: string;
    statut: string;
    lienLive: string | null;
    lienReplay: string | null;
  }>(`/masterclasses/${id}/access`);

  if (!res.ok || !res.data) {
    return {
      ok: false,
      error:
        res.error ?? "Vous devez être inscrit pour accéder aux liens.",
    };
  }
  return { ok: true, data: res.data };
}

export async function createMasterclassAction(dto: {
  titre: string;
  intervenant: string;
  description: string;
  categorie: string;
  dateSession: string;
  duree: number;
  lienLive?: string;
  lienReplay?: string;
  statut?: MasterclassStatusValue;
  maxParticipants?: number;
}): Promise<{ ok: boolean; data?: MasterclassApiItem; error?: string }> {
  const res = await apiRequest<MasterclassApiItem>("/masterclasses", {
    method: "POST",
    body: dto,
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de créer la masterclass.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true, data: res.data };
}

export async function updateMasterclassAction(
  id: string,
  dto: Partial<{
    titre: string;
    intervenant: string;
    description: string;
    categorie: string;
    dateSession: string;
    duree: number;
    lienLive: string;
    lienReplay: string;
    statut: MasterclassStatusValue;
    maxParticipants: number;
  }>
): Promise<{ ok: boolean; data?: MasterclassApiItem; error?: string }> {
  const res = await apiRequest<MasterclassApiItem>(`/masterclasses/${id}`, {
    method: "PATCH",
    body: dto,
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de modifier la masterclass.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true, data: res.data };
}

export async function deleteMasterclassAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/masterclasses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer la masterclass.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

export async function listMasterclassRegistrationsAction(id: string): Promise<{
  ok: boolean;
  data: MasterclassRegistrationApiItem[];
  error?: string;
}> {
  const res = await apiRequest<MasterclassRegistrationApiItem[]>(
    `/masterclasses/${id}/registrations`
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger les inscrits.",
    };
  }
  return { ok: true, data: res.data };
}

export async function markMasterclassAttendanceAction(
  masterclassId: string,
  userId: string,
  attended: boolean
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(
    `/masterclasses/${masterclassId}/registrations/${userId}/attendance`,
    {
      method: "PATCH",
      body: { attended },
    }
  );
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de mettre à jour la présence.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

// ================================
// OPPORTUNITÉS (F12)
// ================================

export async function listOpportunitiesAction(filter?: {
  categorie?: string;
  localisation?: string;
  search?: string;
  status?: string;
}): Promise<{ ok: boolean; data: OpportunityApiItem[]; error?: string }> {
  const res = await apiRequest<{ data: OpportunityApiItem[] }>(
    "/opportunities",
    {
      auth: false,
      query: {
        categorie:
          filter?.categorie && filter.categorie !== "ALL"
            ? filter.categorie
            : undefined,
        localisation: filter?.localisation?.trim() || undefined,
        search: filter?.search?.trim() || undefined,
        status:
          filter?.status && filter.status !== "ALL"
            ? filter.status
            : undefined,
        limit: 50,
      },
    }
  );

  if (!res.ok || !res.data) {
    return { ok: false, data: [], error: res.error };
  }
  return { ok: true, data: res.data.data ?? [] };
}

export async function getMyOpportunityFavoritesAction(): Promise<{
  ok: boolean;
  data: OpportunityFavoriteApiItem[];
}> {
  const res = await apiRequest<OpportunityFavoriteApiItem[]>(
    "/opportunities/me/favorites"
  );
  if (!res.ok || !res.data) {
    return { ok: false, data: [] };
  }
  return { ok: true, data: res.data };
}

export async function addOpportunityFavoriteAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/opportunities/${id}/favorite`, {
    method: "POST",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'ajouter aux favoris.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

export async function removeOpportunityFavoriteAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/opportunities/${id}/favorite`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de retirer des favoris.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

export async function createOpportunityAction(dto: {
  titre: string;
  organisation: string;
  categorie: OpportunityCategoryValue;
  description: string;
  localisation?: string;
  typeContrat?: string;
  lienCandidature: string;
  dateExpiration: string;
}): Promise<{ ok: boolean; data?: OpportunityApiItem; error?: string }> {
  const res = await apiRequest<OpportunityApiItem>("/opportunities", {
    method: "POST",
    body: dto,
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de publier cette opportunité.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true, data: res.data };
}

export async function updateOpportunityAction(
  id: string,
  dto: Partial<{
    titre: string;
    organisation: string;
    categorie: OpportunityCategoryValue;
    description: string;
    localisation: string;
    typeContrat: string;
    lienCandidature: string;
    dateExpiration: string;
    status: OpportunityStatusValue;
  }>
): Promise<{ ok: boolean; data?: OpportunityApiItem; error?: string }> {
  const res = await apiRequest<OpportunityApiItem>(`/opportunities/${id}`, {
    method: "PATCH",
    body: dto,
  });
  if (!res.ok || !res.data) {
    return {
      ok: false,
      error: res.error ?? "Impossible de mettre à jour l'opportunité.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true, data: res.data };
}

export async function deleteOpportunityAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/opportunities/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de supprimer l'opportunité.",
    };
  }
  revalidateCatalogPaths();
  return { ok: true };
}

// ================================
// SIGNALEMENTS & MATCHING (F16)
// ================================

export async function createReportAction(dto: {
  reportedUserId?: string;
  targetType: string;
  targetId: string;
  motif: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest("/reports", {
    method: "POST",
    body: dto,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible d'envoyer le signalement.",
    };
  }
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function listMyReportsAction(): Promise<{
  ok: boolean;
  data: ReportApiItem[];
  error?: string;
}> {
  const res = await apiRequest<ReportApiItem[] | { data?: ReportApiItem[] }>(
    "/reports/me"
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: [],
      error: res.error ?? "Impossible de charger vos signalements.",
    };
  }
  const items = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  return { ok: true, data: items };
}

export async function listAdminReportsAction(status?: string): Promise<{
  ok: boolean;
  data: ReportApiItem[];
  error?: string;
}> {
  const res = await apiRequest<{ data: ReportApiItem[] }>("/admin/reports", {
    query: {
      status: status && status !== "ALL" ? status : undefined,
      limit: 50,
    },
  });
  if (!res.ok || !res.data) {
    return { ok: false, data: [], error: res.error };
  }
  return { ok: true, data: res.data.data ?? [] };
}

export async function updateAdminReportAction(
  id: string,
  payload: {
    status: ReportStatusValue;
    adminNotes?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest(`/admin/reports/${id}`, {
    method: "PATCH",
    body: payload,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de mettre à jour le signalement.",
    };
  }
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function getMatchingWeightsAction(): Promise<{
  ok: boolean;
  data: MatchingWeightsApiData;
  error?: string;
}> {
  const res = await apiRequest<MatchingWeightsApiData>(
    "/admin/matching-weights"
  );
  if (!res.ok || !res.data) {
    return {
      ok: false,
      data: {
        expertiseWeight: 0.3,
        objectiveWeight: 0.25,
        sectorWeight: 0.15,
        availabilityWeight: 0.1,
        languageWeight: 0.1,
        formatWeight: 0.1,
        isDefault: true,
      },
      error: res.error,
    };
  }
  return { ok: true, data: res.data };
}

export async function updateMatchingWeightsAction(dto: {
  expertiseWeight: number;
  objectiveWeight: number;
  sectorWeight: number;
  availabilityWeight: number;
  languageWeight: number;
  formatWeight: number;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await apiRequest("/admin/matching-weights", {
    method: "PATCH",
    body: dto,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error ?? "Impossible de sauvegarder les pondérations.",
    };
  }
  revalidatePath("/admin/moderation");
  return { ok: true };
}
