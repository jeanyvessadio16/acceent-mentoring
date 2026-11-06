import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_ROLE_COOKIE,
  USER_ID_COOKIE,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
} from '@/lib/auth/constants';
import { isTokenExpired } from '@/lib/auth/token';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const userRole = request.cookies.get(USER_ROLE_COOKIE)?.value;

  const isExpired = isTokenExpired(accessToken, 0);
  const isAuthenticated = Boolean(accessToken && !isExpired);
  const canRefresh = Boolean(refreshToken);

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  // Si l'utilisateur accède à une page d'auth avec un signal d'expiration explicite ou un token définitivement mort
  if (isAuthRoute) {
    const isForcedAuth =
      request.nextUrl.searchParams.has('sessionExpired') ||
      request.nextUrl.searchParams.has('callbackUrl') ||
      request.nextUrl.searchParams.has('redirect') ||
      request.nextUrl.searchParams.has('logout') ||
      (accessToken && isExpired && !canRefresh);

    if (isForcedAuth) {
      const response = NextResponse.next();
      const cookieOptions = { path: '/', maxAge: 0 };
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      response.cookies.delete(USER_ROLE_COOKIE);
      response.cookies.delete(USER_ID_COOKIE);
      response.cookies.delete(USER_NAME_COOKIE);
      response.cookies.delete(USER_EMAIL_COOKIE);

      response.cookies.set(ACCESS_TOKEN_COOKIE, '', cookieOptions);
      response.cookies.set(REFRESH_TOKEN_COOKIE, '', cookieOptions);
      response.cookies.set(USER_ROLE_COOKIE, '', cookieOptions);
      response.cookies.set(USER_ID_COOKIE, '', cookieOptions);
      response.cookies.set(USER_NAME_COOKIE, '', cookieOptions);
      response.cookies.set(USER_EMAIL_COOKIE, '', cookieOptions);
      return response;
    }

    // Rediriger vers l'espace uniquement si le token d'accès est réellement valide
    if (isAuthenticated) {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (userRole === 'MENTOR' || userRole === 'EXPERT') {
        return NextResponse.redirect(new URL('/mentor/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/beneficiary/dashboard', request.url));
    }
  }

  // Protection des espaces privés
  const isBeneficiaryRoute = pathname.startsWith('/beneficiary');
  const isMentorRoute = pathname.startsWith('/mentor');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isBeneficiaryRoute || isMentorRoute || isAdminRoute) {
    // Si aucun token valide et aucun refresh token n'est disponible, redirection vers /login
    if (!isAuthenticated && !canRefresh) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Contrôle RBAC d'accès aux espaces
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isMentorRoute && userRole !== 'MENTOR' && userRole !== 'EXPERT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/beneficiary/dashboard', request.url));
    }

    if (isBeneficiaryRoute && userRole && userRole !== 'BENEFICIARY') {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (userRole === 'MENTOR' || userRole === 'EXPERT') {
        return NextResponse.redirect(new URL('/mentor/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/beneficiary/:path*',
    '/mentor/:path*',
    '/admin/:path*',
  ],
};
