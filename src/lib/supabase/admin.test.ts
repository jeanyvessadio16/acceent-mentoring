import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createAdminClient } from "./admin";

describe("createAdminClient security guards", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("lève une erreur explicite si appelé côté navigateur (window défini)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test_key_12345";

    expect(() => createAdminClient()).toThrow(
      "createAdminClient() ne peut jamais être exécuté côté navigateur."
    );
  });

  it("lève une erreur si SUPABASE_SECRET_KEY et SUPABASE_SERVICE_ROLE_KEY sont absentes même avec la clé publique définie", () => {
    vi.stubGlobal("window", undefined);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_public_only";
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow(
      "SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) manquante côté serveur."
    );
  });

  it("refuse d'utiliser une clé publique sb_publishable_ comme clé admin", () => {
    vi.stubGlobal("window", undefined);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_publishable_fake_key";

    expect(() => createAdminClient()).toThrow(
      "Une clé publique (sb_publishable_) ne peut pas être utilisée comme clé admin."
    );
  });

  it("initialise le client admin côté serveur avec une clé secrète valide", () => {
    vi.stubGlobal("window", undefined);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_valid_server_key";

    const client = createAdminClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });
});
