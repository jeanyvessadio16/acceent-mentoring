import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getApiBaseUrlFromEnv, isJwtExpired } from "./token-utils";

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("auth/token-utils", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("retourne une URL API normalisée sans slash final", () => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrlFromEnv()).toBe(
      "https://plateforme-mentoring-api.onrender.com/api/v1"
    );

    process.env.API_URL = "https://mentoring-api.onrender.com/api/v1///";
    expect(getApiBaseUrlFromEnv()).toBe(
      "https://mentoring-api.onrender.com/api/v1"
    );
  });

  it("valide correctement l'expiration d'un JWT avec fenêtre de tolérance", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isJwtExpired(makeJwt({ exp: now + 600 }))).toBe(false);
    expect(isJwtExpired(makeJwt({ exp: now - 10 }))).toBe(true);
    expect(isJwtExpired(makeJwt({ exp: now + 10 }), 30)).toBe(true);
    expect(isJwtExpired(makeJwt({ sub: "no-exp" }))).toBe(true);
    expect(isJwtExpired("malformed-token")).toBe(true);
    expect(isJwtExpired("")).toBe(true);
  });
});
