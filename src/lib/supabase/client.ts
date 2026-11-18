import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les composants côté navigateur (Client Components).
 * Gère automatiquement les sessions et les cookies dans le navigateur.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
