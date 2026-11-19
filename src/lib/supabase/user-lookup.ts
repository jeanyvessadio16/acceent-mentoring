import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthIdentity {
  id: string;
  email?: string | null;
}

/**
 * Recherche sécurisée d'un utilisateur PostgreSQL par supabaseUid puis fallback par email,
 * sans interpolation de chaîne dans `.or()`.
 */
export async function findDbUserByAuth<T = any>(
  adminDb: SupabaseClient,
  authUser: AuthIdentity,
  selectColumns = "*",
): Promise<{ data: T | null; error: { message: string } | null }> {
  const byUid = await (adminDb.from("User") as any)
    .select(selectColumns)
    .eq("supabaseUid", authUser.id)
    .maybeSingle();

  if (byUid.data || !authUser.email) {
    return {
      data: (byUid.data as T | null) ?? null,
      error: byUid.error ? { message: byUid.error.message } : null,
    };
  }

  const byEmail = await (adminDb.from("User") as any)
    .select(selectColumns)
    .eq("email", authUser.email)
    .maybeSingle();

  return {
    data: (byEmail.data as T | null) ?? null,
    error: byEmail.error ? { message: byEmail.error.message } : null,
  };
}
