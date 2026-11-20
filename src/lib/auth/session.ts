import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  isJwtExpired,
} from "./token-utils";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, isJwtExpired };

export interface ApiSessionPayload {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number;
}

export async function getSessionTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export async function setSessionCookies(
  session: ApiSessionPayload
): Promise<void> {
  if (!session.accessToken) {
    return;
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const accessMaxAge =
    typeof session.expiresIn === "number" && session.expiresIn > 0
      ? session.expiresIn
      : DEFAULT_ACCESS_TOKEN_MAX_AGE;

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: accessMaxAge,
  });

  if (session.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
