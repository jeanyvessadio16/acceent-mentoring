import "server-only";
import { createClient } from "@/lib/supabase/server";

export function getApiBaseUrl(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  return raw.replace(/\/+$/, "");
}

export async function getAuthBearerToken(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true, query } = options;

  const headers: Record<string, string> = {};
  if (auth) {
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

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const parsed: unknown = isJson
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      let errorMsg = `Erreur API (${response.status}).`;
      if (parsed && typeof parsed === "object" && "message" in parsed) {
        const rawMsg = (parsed as { message?: unknown }).message;
        if (typeof rawMsg === "string" && rawMsg.trim()) {
          errorMsg = rawMsg;
        } else if (Array.isArray(rawMsg) && rawMsg.length > 0) {
          errorMsg = rawMsg.map((item) => String(item)).join(", ");
        }
      }
      return {
        ok: false,
        status: response.status,
        data: null,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsed as T,
    };
  } catch (err) {
    console.error(`Erreur réseau apiRequest (${method} ${normalizedPath}):`, err);
    return {
      ok: false,
      status: 503,
      data: null,
      error: "Impossible de joindre le serveur API. Veuillez réessayer.",
    };
  }
}
