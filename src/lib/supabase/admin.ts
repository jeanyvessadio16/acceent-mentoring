import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec privilèges de service (Service Role / Secret Key)
 * À utiliser EXCLUSIVEMENT côté serveur dans les Server Actions ou Route Handlers sécurisés.
 * Permet d'interroger et de mettre à jour les tables avec contournement RLS pour l'administration.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() ne peut jamais être exécuté côté navigateur.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL manquant pour createAdminClient().");
  }

  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) manquante côté serveur."
    );
  }

  if (secretKey.startsWith("sb_publishable_")) {
    throw new Error(
      "Une clé publique (sb_publishable_) ne peut pas être utilisée comme clé admin."
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
