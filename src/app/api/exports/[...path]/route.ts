import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl, getAuthBearerToken } from "@/lib/api/server-client";

const ALLOWED_EXPORT_PATHS = new Set([
  "users/me/export",
  "admin/exports/users",
  "admin/exports/impact",
]);

const ALLOWED_FORMATS = new Set(["csv", "xlsx", "pdf", "json"]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const joinedPath = (path || []).join("/");

  if (!ALLOWED_EXPORT_PATHS.has(joinedPath)) {
    return NextResponse.json(
      { error: "Chemin d'export non autorisé." },
      { status: 403 }
    );
  }

  const token = await getAuthBearerToken();
  if (!token) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 }
    );
  }

  const format = request.nextUrl.searchParams.get("format");
  const upstreamParams = new URLSearchParams();
  if (format && ALLOWED_FORMATS.has(format)) {
    upstreamParams.set("format", format);
  }

  const qs = upstreamParams.toString();
  const upstreamUrl = `${getApiBaseUrl()}/${joinedPath}${qs ? `?${qs}` : ""}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const buffer = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    if (!upstream.ok) {
      return new NextResponse(buffer, {
        status: upstream.status,
        headers: { "Content-Type": contentType },
      });
    }

    const fallbackFilename =
      joinedPath === "users/me/export"
        ? "acceent-mes-donnees-rgpd.json"
        : `${joinedPath.replaceAll("/", "-")}.${format || "csv"}`;

    const disposition =
      upstream.headers.get("content-disposition") ||
      `attachment; filename="${fallbackFilename}"`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur proxy export :", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'export depuis le serveur API." },
      { status: 503 }
    );
  }
}
