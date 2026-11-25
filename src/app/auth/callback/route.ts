import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  getApiBaseUrlFromEnv,
} from "@/lib/auth/token-utils";

const SAFE_HOST_PATTERN = /^[a-zA-Z0-9.-]+(:\d+)?$/;

function sanitizeRedirectPath(rawPath: string | null): string {
  if (!rawPath) return "/";
  const trimmed = rawPath.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\")
  ) {
    return "/";
  }
  return trimmed;
}

interface VerifyOtpResponse {
  redirectUrl?: string;
  dashboardUrl?: string;
  session?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  } | null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "signup";
  const explicitNext = searchParams.get("next");

  if (tokenHash) {
    try {
      const verifyRes = await fetch(`${getApiBaseUrlFromEnv()}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenHash, type }),
        cache: "no-store",
      });

      if (verifyRes.ok) {
        const data = (await verifyRes.json().catch(() => null)) as VerifyOtpResponse | null;
        const next = sanitizeRedirectPath(
          explicitNext ||
            (type === "recovery" ? "/reset-password" : data?.redirectUrl) ||
            data?.dashboardUrl ||
            "/"
        );
        const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
        const isLocalEnv = process.env.NODE_ENV === "development";
        const redirectTarget = isLocalEnv
          ? `${origin}${next}`
          : forwardedHost && SAFE_HOST_PATTERN.test(forwardedHost)
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;

        const response = NextResponse.redirect(redirectTarget);
        const isProd = process.env.NODE_ENV === "production";

        if (data?.session?.accessToken) {
          response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            path: "/",
            maxAge:
              typeof data.session.expiresIn === "number" && data.session.expiresIn > 0
                ? data.session.expiresIn
                : DEFAULT_ACCESS_TOKEN_MAX_AGE,
          });
        }
        if (data?.session?.refreshToken) {
          response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            path: "/",
            maxAge: REFRESH_TOKEN_MAX_AGE,
          });
        }

        return response;
      }
    } catch (err) {
      console.error("Erreur auth callback verify-otp :", err);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-error`);
}
