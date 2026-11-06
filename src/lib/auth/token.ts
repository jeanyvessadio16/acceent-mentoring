/**
 * Utilitaires de décodage et de validation temporelle des tokens JWT Supabase.
 */

export interface DecodedJwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Décode la charge utile (payload) d'un token JWT sans vérifier la signature cryptographique.
 */
export function decodeJwtPayload(token?: string | null): DecodedJwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let decoded = '';
    if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(base64, 'base64').toString('utf-8');
    } else if (typeof atob !== 'undefined') {
      decoded = atob(base64);
    } else {
      return null;
    }
    return JSON.parse(decoded) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Vérifie si le token JWT est expiré ou est sur le point d'expirer dans une marge de sécurité (par défaut 60 secondes).
 */
export function isTokenExpired(token?: string | null, marginSeconds: number = 60): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now() + marginSeconds * 1000;
}

