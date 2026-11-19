/**
 * Vérifie qu'une URL externe utilise exclusivement les protocoles http: ou https:
 * afin de bloquer les vecteurs XSS (`javascript:`, `data:`, `vbscript:`).
 */
export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Assainit une URL externe avant rendu dans un attribut `href` ou `src`.
 */
export function sanitizeExternalUrl(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!isSafeHttpUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Assainit un chemin de redirection interne (`?redirect=...`) pour prévenir
 * les redirections ouvertes (`//evil.com`, URL absolues, backslashes) et boucles d'auth.
 */
export function sanitizeInternalRedirectPath(
  rawPath: string | null | undefined
): string | null {
  if (!rawPath) {
    return null;
  }
  const trimmed = rawPath.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed === "/login" ||
    trimmed.startsWith("/login?") ||
    trimmed === "/register" ||
    trimmed.startsWith("/register?")
  ) {
    return null;
  }
  return trimmed;
}
