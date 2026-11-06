import { cookies } from 'next/headers';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_ROLE_COOKIE,
  USER_ID_COOKIE,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
} from './constants';
import { isTokenExpired } from './token';
import { authApi } from '@/lib/api/auth';

export * from './constants';
export * from './token';

export async function setAuthCookies(params: {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  expiresAt?: number;
}) {
  try {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    const maxAge = 7 * 24 * 60 * 60; // 7 jours

    cookieStore.set(ACCESS_TOKEN_COOKIE, params.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, params.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    });

    cookieStore.set(USER_ROLE_COOKIE, params.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    cookieStore.set(USER_ID_COOKIE, params.userId, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    if (params.userName) {
      cookieStore.set(USER_NAME_COOKIE, encodeURIComponent(params.userName), {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    if (params.userEmail) {
      cookieStore.set(USER_EMAIL_COOKIE, params.userEmail, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }
  } catch {
    // Si appelé dans un contexte en lecture seule (Server Component render), ignorer silencieusement
  }
}

export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
    cookieStore.delete(USER_ROLE_COOKIE);
    cookieStore.delete(USER_ID_COOKIE);
    cookieStore.delete(USER_NAME_COOKIE);
    cookieStore.delete(USER_EMAIL_COOKIE);
  } catch {
    // Contexte en lecture seule
  }
}

export async function getSessionTokens() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const role = cookieStore.get(USER_ROLE_COOKIE)?.value;
  const userId = cookieStore.get(USER_ID_COOKIE)?.value;
  const rawName = cookieStore.get(USER_NAME_COOKIE)?.value;
  const userName = rawName ? decodeURIComponent(rawName) : undefined;
  const userEmail = cookieStore.get(USER_EMAIL_COOKIE)?.value;

  // Si le token d'accès est absent, expiré ou sur le point d'expirer (< 60 secondes)
  // et qu'un refresh token est disponible, déclencher impérativement le renouvellement
  // AVANT de retourner la session afin de ne jamais envoyer une requête expirée à l'API NestJS.
  const needsRefresh = (!accessToken || isTokenExpired(accessToken, 60)) && Boolean(refreshToken);

  if (needsRefresh && refreshToken) {
    try {
      const refreshed = await authApi.refresh(refreshToken);
      if (refreshed?.accessToken && refreshed?.refreshToken) {
        accessToken = refreshed.accessToken;
        refreshToken = refreshed.refreshToken;

        await setAuthCookies({
          accessToken,
          refreshToken,
          role: role || 'BENEFICIARY',
          userId: userId || '',
          userName,
          userEmail,
          expiresAt: refreshed.expiresAt,
        });

        return {
          accessToken,
          refreshToken,
          role,
          userId,
          userName,
          userEmail,
          isAuthenticated: true,
        };
      }
    } catch {
      // Le refresh token a expiré ou est invalide, session terminée
      await clearAuthCookies();
      return {
        accessToken: undefined,
        refreshToken: undefined,
        role: undefined,
        userId: undefined,
        userName: undefined,
        userEmail: undefined,
        isAuthenticated: false,
      };
    }
  }

  const isExpired = isTokenExpired(accessToken, 0);

  return {
    accessToken,
    refreshToken,
    role,
    userId,
    userName,
    userEmail,
    isAuthenticated: Boolean(accessToken && !isExpired),
  };
}
