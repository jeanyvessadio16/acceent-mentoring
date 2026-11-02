import { cookies } from 'next/headers';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_ROLE_COOKIE,
  USER_ID_COOKIE,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
} from './constants';

export * from './constants';

export async function setAuthCookies(params: {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  expiresAt?: number;
}) {
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
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_ROLE_COOKIE);
  cookieStore.delete(USER_ID_COOKIE);
  cookieStore.delete(USER_NAME_COOKIE);
  cookieStore.delete(USER_EMAIL_COOKIE);
}

export async function getSessionTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const role = cookieStore.get(USER_ROLE_COOKIE)?.value;
  const userId = cookieStore.get(USER_ID_COOKIE)?.value;
  const rawName = cookieStore.get(USER_NAME_COOKIE)?.value;
  const userName = rawName ? decodeURIComponent(rawName) : undefined;
  const userEmail = cookieStore.get(USER_EMAIL_COOKIE)?.value;

  return {
    accessToken,
    refreshToken,
    role,
    userId,
    userName,
    userEmail,
    isAuthenticated: Boolean(accessToken),
  };
}
