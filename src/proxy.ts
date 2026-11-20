import { type NextRequest, NextResponse } from "next/server";
import { updateApiSession } from "@/lib/auth/proxy";

const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/beneficiary",
  "/mentor",
  "/expert",
  "/partenaire",
  "/diagnostic",
  "/profile",
];

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateApiSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match tous les chemins de requête sauf :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico (icône de favori)
     * - Images et fichiers publics (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
