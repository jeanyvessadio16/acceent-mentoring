/**
 * Détecte les exceptions internes de contrôle de flux Next.js (App Router / Cache Components / redirects)
 * qui doivent être relancées telles quelles et ne jamais être avalées par un bloc catch.
 */
export function isNextInternalError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("digest" in err)) {
    return false;
  }
  const digest = (err as { digest?: unknown }).digest;
  return (
    digest === "HANGING_PROMISE_REJECTION" ||
    (typeof digest === "string" && digest.startsWith("NEXT_"))
  );
}
