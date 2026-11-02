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
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
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
