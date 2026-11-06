'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function SupabaseAuthListener() {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (err) {
      console.warn('[SupabaseAuthListener] Client Supabase non initialisé:', err);
      return;
    }

    // 1. Écouter les événements d'authentification et de rafraîchissement automatique de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session) {
        try {
          await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at,
            }),
          });
        } catch (syncErr) {
          console.error('[SupabaseAuthListener] Erreur synchronisation session rafraîchie:', syncErr);
        }
      } else if (event === 'SIGNED_OUT') {
        try {
          await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_OUT' }),
          });
        } catch (syncErr) {
          console.error('[SupabaseAuthListener] Erreur déconnexion:', syncErr);
        }
      }
    });

    // 2. Synchronisation initiale : si les cookies contiennent des tokens mais que le client Supabase n'est pas encore amorcé
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
            const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                // Si le token d'accès a expiré, tenter un rafraîchissement immédiat via le refresh token
                console.debug('[SupabaseAuthListener] setSession retourné une erreur, tentative refreshSession:', error.message);
                await supabase.auth.refreshSession({ refresh_token: refreshToken });
              }
            }
          }
        } catch (initErr) {
          console.debug('[SupabaseAuthListener] Erreur amorçage session Supabase:', initErr);
        }
      })();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

