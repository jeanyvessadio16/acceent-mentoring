import "server-only";
import { io } from "next/cache";
import {
  getSessionTokens,
  isJwtExpired,
  setSessionCookies,
  type ApiSessionPayload,
} from "@/lib/auth/session";
import { getApiBaseUrlFromEnv } from "@/lib/auth/token-utils";
import { isNextInternalError } from "@/lib/utils/next-errors";

export function getApiBaseUrl(): string {
  return getApiBaseUrlFromEnv();
}

interface RefreshApiResponse {
  session?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

async function refreshAccessToken(
  refreshToken: string
): Promise<ApiSessionPayload | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json().catch(() => null)) as RefreshApiResponse | null;
    if (!data?.session?.accessToken) {
      return null;
    }

    const nextSession: ApiSessionPayload = {
      accessToken: data.session.accessToken,
      refreshToken: data.session.refreshToken ?? refreshToken,
      expiresIn: data.session.expiresIn,
    };

    try {
      await setSessionCookies(nextSession);
    } catch (err) {
      if (isNextInternalError(err)) {
        throw err;
      }
      // Dans un Server Component en lecture seule, la mise à jour de cookie est ignorée.
    }

    return nextSession;
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    return null;
  }
}

export async function getAuthBearerToken(): Promise<string | null> {
  await io();
  try {
    const { accessToken, refreshToken } = await getSessionTokens();

    if (accessToken && !isJwtExpired(accessToken)) {
      return accessToken;
    }

    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken);
      return refreshed?.accessToken ?? null;
    }

    return null;
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    return null;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  tokenOverride?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${getApiBaseUrl()}${normalizedPath}`;

  if (query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url = `${url}?${qs}`;
    }
  }

  return url;
}

function extractApiError(status: number, parsed: unknown): string {
  let errorMsg = `Erreur API (${status}).`;
  if (parsed && typeof parsed === "object" && "message" in parsed) {
    const rawMsg = (parsed as { message?: unknown }).message;
    if (typeof rawMsg === "string" && rawMsg.trim()) {
      errorMsg = rawMsg;
    } else if (Array.isArray(rawMsg) && rawMsg.length > 0) {
      errorMsg = rawMsg.map((item) => String(item)).join(", ");
    }
  }
  return errorMsg;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true, tokenOverride, query } = options;

  const headers: Record<string, string> = {};
  if (tokenOverride) {
    headers.Authorization = `Bearer ${tokenOverride}`;
  } else if (auth) {
    const token = await getAuthBearerToken();
    if (!token) {
      return {
        ok: false,
        status: 401,
        data: null,
        error: "Session expirée. Veuillez vous reconnecter.",
      };
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(path, query);
  const serializedBody = body !== undefined ? JSON.stringify(body) : undefined;
  if (serializedBody !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  try {
    let response = await fetch(url, {
      method,
      headers,
      body: serializedBody,
      cache: "no-store",
    });

    if (response.status === 401 && auth && !tokenOverride) {
      const { refreshToken } = await getSessionTokens();
      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed?.accessToken) {
          headers.Authorization = `Bearer ${refreshed.accessToken}`;
          response = await fetch(url, {
            method,
            headers,
            body: serializedBody,
            cache: "no-store",
          });
        }
      }
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const parsed: unknown = isJson
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: extractApiError(response.status, parsed),
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsed as T,
    };
  } catch (err) {
    if (isNextInternalError(err)) {
      throw err;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    console.error(`Erreur réseau apiRequest (${method} ${normalizedPath}):`, err);
    return {
      ok: false,
      status: 503,
      data: null,
      error: "Impossible de joindre le serveur API. Veuillez réessayer.",
    };
  }
}
