import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockGetUser = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
  })),
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

  it("normalise API_URL et utilise http://localhost:3001/api/v1 par défaut", () => {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe("http://localhost:3001/api/v1");

    process.env.API_URL = "https://api.example.com/api/v1///";
    expect(getApiBaseUrl()).toBe("https://api.example.com/api/v1");
  });

  it("retourne 401 si la session est absente et auth=true", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

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
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "jwt-token-xyz" } },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: [{ id: "m1" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest<{ data: Array<{ id: string }> }>(
      "/mentors",
      {
        query: {
          search: "Finance",
          pays: "",
          minExperience: 5,
          unused: undefined,
        },
      }
    );

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
