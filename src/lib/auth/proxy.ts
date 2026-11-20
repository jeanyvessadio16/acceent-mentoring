import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  getApiBaseUrlFromEnv,
  isJwtExpired,
} from "./token-utils";

interface RefreshEndpointResponse {
  session?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

export async function updateApiSession(request: NextRequest): Promise<{
  response: NextResponse;
  isAuthenticated: boolean;
}> {
  let response = NextResponse.next({ request });
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  if (accessToken && !isJwtExpired(accessToken)) {
    return { response, isAuthenticated: true };
  }

  if (!refreshToken) {
    return { response, isAuthenticated: false };
  }

  try {
    const res = await fetch(`${getApiBaseUrlFromEnv()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return { response, isAuthenticated: false };
    }

    const data = (await res.json().catch(() => null)) as RefreshEndpointResponse | null;
    const newAccessToken = data?.session?.accessToken;
    if (!newAccessToken) {
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return { response, isAuthenticated: false };
    }

    const newRefreshToken = data.session?.refreshToken ?? refreshToken;
    const isProd = process.env.NODE_ENV === "production";
    const accessMaxAge =
      typeof data.session?.expiresIn === "number" && data.session.expiresIn > 0
        ? data.session.expiresIn
        : DEFAULT_ACCESS_TOKEN_MAX_AGE;

    request.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken);
    if (newRefreshToken) {
      request.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken);
    }

    response = NextResponse.next({ request });
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: accessMaxAge,
    });

    if (newRefreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return { response, isAuthenticated: true };
  } catch {
    return { response, isAuthenticated: false };
  }
}
