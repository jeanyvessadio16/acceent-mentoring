import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec privilèges de service (Service Role / Secret Key)
 * À utiliser EXCLUSIVEMENT côté serveur dans les Server Actions ou Route Handlers sécurisés.
 * Permet d'interroger et de mettre à jour les tables avec contournement RLS pour l'administration.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
