import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthIdentity {
  id: string;
  email?: string | null;
}

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

interface SelectableUserTable<T> {
  select: (cols: string) => {
    eq: (col: string, val: string) => {
      maybeSingle: () => Promise<QueryResult<T>>;
    };
  };
}

/**
 * Recherche sécurisée d'un utilisateur PostgreSQL par supabaseUid puis fallback par email,
 * sans interpolation de chaîne dans `.or()`.
 */
export async function findDbUserByAuth<T = Record<string, unknown>>(
  adminDb: SupabaseClient,
  authUser: AuthIdentity,
  selectColumns = "*"
): Promise<QueryResult<T>> {
  const userTable = adminDb.from(
    "User"
  ) as unknown as SelectableUserTable<T>;

  const byUid = await userTable
    .select(selectColumns)
    .eq("supabaseUid", authUser.id)
    .maybeSingle();

  if (byUid.data || !authUser.email) {
    return {
      data: byUid.data ?? null,
      error: byUid.error ? { message: byUid.error.message } : null,
    };
  }

  const byEmail = await userTable
    .select(selectColumns)
    .eq("email", authUser.email)
    .maybeSingle();

  return {
    data: byEmail.data ?? null,
    error: byEmail.error ? { message: byEmail.error.message } : null,
  };
}
