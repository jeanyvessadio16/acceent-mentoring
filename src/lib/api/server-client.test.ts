import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockGetSessionTokens, mockSetSessionCookies, mockIsJwtExpired } =
  vi.hoisted(() => ({
    mockGetSessionTokens: vi.fn(),
    mockSetSessionCookies: vi.fn(),
    mockIsJwtExpired: vi.fn(),
  }));

vi.mock("@/lib/auth/session", () => ({
  getSessionTokens: mockGetSessionTokens,
  setSessionCookies: mockSetSessionCookies,
  isJwtExpired: mockIsJwtExpired,
}));

import { apiRequest, getApiBaseUrl } from "./server-client";

describe("api/server-client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("normalise API_URL et utilise l'API Render par défaut", () => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe(
      "https://plateforme-mentoring-api.onrender.com/api/v1"
    );

    process.env.API_URL = "https://api.example.com/api/v1///";
    expect(getApiBaseUrl()).toBe("https://api.example.com/api/v1");
  });

  it("retourne 401 si la session est absente et auth=true", async () => {
    mockGetSessionTokens.mockResolvedValue({
      accessToken: null,
      refreshToken: null,
    });

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("/mentoring/programs");

    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
    expect(res.data).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sérialise les query params, envoie le Bearer token et parse la réponse JSON", async () => {
    process.env.API_URL = "https://api.acceent.org/api/v1";
    mockGetSessionTokens.mockResolvedValue({
      accessToken: "jwt-token-xyz",
      refreshToken: "refresh-token-xyz",
    });
    mockIsJwtExpired.mockReturnValue(false);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: [{ id: "m1" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest<{ data: Array<{ id: string }> }>("/mentors", {
      query: {
        search: "Finance",
        pays: "",
        minExperience: 5,
        unused: undefined,
      },
    });

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ data: [{ id: "m1" }] });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.acceent.org/api/v1/mentors?search=Finance&minExperience=5",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token-xyz",
        }),
      })
    );
  });

  it("rafraîchit automatiquement le jeton via POST /auth/refresh si le jeton est expiré ou retourne 401", async () => {
    process.env.API_URL = "https://api.acceent.org/api/v1";
    mockGetSessionTokens
      .mockResolvedValueOnce({
        accessToken: "expired-jwt",
        refreshToken: "valid-refresh",
      })
      .mockResolvedValueOnce({
        accessToken: "valid-jwt",
        refreshToken: "valid-refresh",
      });
    mockIsJwtExpired.mockReturnValue(true);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          session: {
            accessToken: "fresh-jwt",
            refreshToken: "fresh-refresh",
            expiresIn: 3600,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest<{ ok: boolean }>("/users/me");

    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.acceent.org/api/v1/auth/refresh",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.acceent.org/api/v1/users/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fresh-jwt",
        }),
      })
    );
    expect(mockSetSessionCookies).toHaveBeenCalledWith({
      accessToken: "fresh-jwt",
      refreshToken: "fresh-refresh",
      expiresIn: 3600,
    });
  });

  it("extrait le message d'erreur structuré des réponses non-2xx et gère les pannes réseau", async () => {
    process.env.API_URL = "https://api.acceent.org/api/v1";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: ["Champ requis", "Format invalide"] }),
      })
      .mockRejectedValueOnce(new Error("ECONNREFUSED"));

    vi.stubGlobal("fetch", fetchMock);

    const badRes = await apiRequest("/mentors", { auth: false });
    expect(badRes.ok).toBe(false);
    expect(badRes.status).toBe(400);
    expect(badRes.error).toBe("Champ requis, Format invalide");

    const netRes = await apiRequest("/mentors", { auth: false });
    expect(netRes.ok).toBe(false);
    expect(netRes.status).toBe(503);
    expect(netRes.data).toBeNull();
  });
});
