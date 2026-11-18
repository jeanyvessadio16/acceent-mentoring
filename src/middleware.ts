import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
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
