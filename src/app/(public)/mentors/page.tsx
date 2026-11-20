import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles } from "lucide-react";

import { apiRequest } from "@/lib/api/server-client";
import { ROUTES } from "@/lib/constants";
import { MentorsFilterableCatalog } from "@/features/mentors/MentorsFilterableCatalog";
import type { MentorSearchResultItem } from "@/lib/actions/mentoring";

export const instant = false;

export const metadata: Metadata = {
  title: "Catalogue des Mentors | ACCEENT Mentoring",
  description:
    "Découvrez les mentors certifiés et experts de la communauté ACCEENT disponibles pour accompagner vos projets en Afrique et dans la diaspora.",
};

export default async function PublicMentorsCatalogPage() {
  await connection();
  const res = await apiRequest<{ data: MentorSearchResultItem[] }>("/mentors", {
    auth: false,
    query: { limit: 50 },
  });

  const mentors = res.data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Communauté de mentors certifiés
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Nos Mentors &amp; Experts disponibles
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Parcourez les profils validés par ACCEENT et accédez à un
              accompagnement structuré adapté à votre secteur et à vos
              objectifs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold">
              {mentors.length} mentor{mentors.length > 1 ? "s" : ""} actif
              {mentors.length > 1 ? "s" : ""}
            </div>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-accent text-slate-950 hover:bg-accent/90 transition-colors"
            >
              <span>Trouver mon mentor</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <MentorsFilterableCatalog initialMentors={mentors} mode="public" />
      </section>
    </div>
  );
}
