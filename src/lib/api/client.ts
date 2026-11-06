import { isTokenExpired } from '@/lib/auth/token';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  error?: string;
  details?: string | string[];

  constructor(statusCode: number, message: string, details?: string | string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
};

export interface ApiClientOptions extends RequestInit {
  token?: string;
  timeoutMs?: number;
  _isRetry?: boolean;
}

/**
 * Renouvelle l'Access Token de manière proactive via le Refresh Token
 * AVANT d'envoyer toute requête à l'API NestJS.
 */
async function renewTokenBeforeRequest(baseUrl: string): Promise<string | null> {
  // Contexte A : Client navigateur
  if (typeof window !== 'undefined') {
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + REFRESH_TOKEN_COOKIE + '=([^;]*)'));
      const cookieRefreshToken = match ? decodeURIComponent(match[2]) : undefined;

      // 1. Tenter via le client Supabase navigateur
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
      const supabase = getSupabaseBrowserClient();

      const { data, error } = cookieRefreshToken
        ? await supabase.auth.refreshSession({ refresh_token: cookieRefreshToken })
        : await supabase.auth.refreshSession();

      if (!error && data.session?.access_token) {
        const freshAccessToken = data.session.access_token;
        // Synchroniser en arrière-plan les cookies HTTP
        fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'TOKEN_REFRESHED',
            accessToken: freshAccessToken,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          }),
        }).catch(() => {});

        return freshAccessToken;
      }

      // 2. Si échec Supabase client, appeler directement l'endpoint /auth/refresh du backend NestJS
      if (cookieRefreshToken) {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: cookieRefreshToken }),
        });
        if (res.ok) {
          const json = await res.json();
          const refreshed = json.data || json;
          if (refreshed?.accessToken) {
            fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'TOKEN_REFRESHED',
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                expiresAt: refreshed.expiresAt,
              }),
            }).catch(() => {});
            return refreshed.accessToken;
          }
        }
      }
    } catch (err) {
      console.warn('[apiClient] Renouvellement proactif navigateur échoué:', err);
    }
  } else {
    // Contexte B : Serveur (Server Action / Route Handler / Server Component)
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const serverRefreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

      if (serverRefreshToken) {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: serverRefreshToken }),
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const refreshed = json.data || json;
          if (refreshed?.accessToken) {
            return refreshed.accessToken;
          }
        }
      }
    } catch {
      // Contexte où cookies() n'est pas accessible
    }
  }

  return null;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const isAuthEndpoint =
    cleanEndpoint.startsWith('/auth/login') ||
    cleanEndpoint.startsWith('/auth/register') ||
    cleanEndpoint.startsWith('/auth/refresh') ||
    cleanEndpoint.startsWith('/auth/forgot-password') ||
    cleanEndpoint.startsWith('/auth/reset-password');

  // Résolution du token actif
  let activeToken = options.token;

  if (!activeToken && typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + ACCESS_TOKEN_COOKIE + '=([^;]*)'));
    if (match) activeToken = decodeURIComponent(match[2]);
  }

  // RÈGLE CRUCIALE : Renouvellement proactif obligatoire.
  // Le client doit renouveler son Access Token via le Refresh Token
  // AVANT d'envoyer une requête expirée à l'API NestJS.
  if (!isAuthEndpoint && activeToken && isTokenExpired(activeToken, 60)) {
    const freshToken = await renewTokenBeforeRequest(baseUrl);
    if (freshToken) {
      activeToken = freshToken;
    }
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (activeToken) {
    headers.set('Authorization', `Bearer ${activeToken}`);
  }

  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      cache: 'no-store',
    });
  } catch (err: any) {
    clearTimeout(timer);

    if (err?.name === 'AbortError') {
      throw new ApiError(
        408,
        'Le serveur a mis trop de temps à répondre (délai dépassé). Veuillez réessayer.',
        'REQUEST_TIMEOUT'
      );
    }

    // Gestion propre des pannes réseau ou serveur API injoignable
    const rawMsg = err?.message || '';
    if (rawMsg.includes('fetch failed') || rawMsg.includes('ECONNREFUSED')) {
      throw new ApiError(
        503,
        `Impossible d'établir la connexion avec le serveur API (${baseUrl}). Assurez-vous que le backend NestJS est bien démarré.`,
        'NETWORK_CONNECTION_ERROR'
      );
    }

    throw new ApiError(0, err?.message || 'Erreur réseau inconnue.', err);
  } finally {
    clearTimeout(timer);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let data: any = null;

  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Filet de sécurité 401 si un token venait tout juste d'être révoqué en cours de requête
    if (
      response.status === 401 &&
      !options._isRetry &&
      !isAuthEndpoint &&
      typeof window !== 'undefined'
    ) {
      try {
        const freshToken = await renewTokenBeforeRequest(baseUrl);
        if (freshToken) {
          return apiClient<T>(endpoint, {
            ...options,
            token: freshToken,
            _isRetry: true,
          });
        }
      } catch {
        // Laisser l'erreur 401 se propager
      }
    }

    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';

    if (isJson && data) {
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (Array.isArray(data.message) && data.message.length > 0) {
        errorMessage = data.message.join('. ');
      }
    } else if (response.status === 401) {
      errorMessage = 'Session expirée ou non autorisée. Veuillez vous reconnecter.';
    } else if (response.status === 403) {
      errorMessage = 'Accès refusé. Vous ne disposez pas des autorisations nécessaires.';
    } else if (response.status === 404) {
      errorMessage = 'La ressource demandée est introuvable.';
    } else if (response.status === 409) {
      errorMessage = data?.message || 'Un conflit est survenu avec une donnée existante.';
    } else if (response.status === 429) {
      errorMessage = 'Trop de requêtes effectuées en peu de temps. Veuillez patienter avant de réessayer.';
    } else if (response.status >= 500) {
      errorMessage = 'Le serveur a rencontré une erreur interne. Nos équipes sont notifiées.';
    }

    throw new ApiError(response.status, errorMessage, isJson ? data?.message : undefined);
  }

  // Déballage automatique si l'API utilise StandardApiResponse (TransformResponseInterceptor)
  if (isJson && data && typeof data === 'object' && 'data' in data && 'success' in data && data.success === true) {
    return data.data as T;
  }

  return data as T;
}
