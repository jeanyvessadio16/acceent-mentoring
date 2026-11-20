export const ACCESS_TOKEN_COOKIE = "acceent_access_token";
export const REFRESH_TOKEN_COOKIE = "acceent_refresh_token";
export const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 heure
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export function getApiBaseUrlFromEnv(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  return raw.replace(/\/+$/, "");
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf-8");
    }
    if (typeof atob === "function") {
      return atob(padded);
    }
    return null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  if (!token || typeof token !== "string") {
    return true;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) {
    return true;
  }
  try {
    const payload = JSON.parse(decoded) as { exp?: unknown };
    if (typeof payload.exp !== "number") {
      return true;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds + skewSeconds;
  } catch {
    return true;
  }
}
