import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";
import { MentorsFilterableCatalog } from "@/features/mentors/MentorsFilterableCatalog";
import type { MentorSearchResultItem } from "@/lib/actions/mentoring";

export const instant = false;

export const metadata: Metadata = {
  title: "Catalogue des Mentors | ACCEENT Mentoring",
  description:
    "Découvrez les mentors certifiés et experts de la communauté ACCEENT disponibles pour accompagner vos projets en Afrique et dans la diaspora.",
};

interface PublicMentorCardRow {
  id: string;
  userId: string;
  fonction: string;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  secteurs: string[] | null;
  langues: string[] | null;
  typesMentoring: string | null;
  disponibilites: string | null;
  biographie: string | null;
  photoUrl: string | null;
  isAvailable: boolean;
  user:
    | {
        id?: string;
        nom: string;
        prenom: string;
        pays: string | null;
      }
    | Array<{
        id?: string;
        nom: string;
        prenom: string;
        pays: string | null;
      }>
    | null;
}

export default async function PublicMentorsCatalogPage() {
  await connection();
  const adminDb = createAdminClient();

  const { data } = await adminDb
    .from("MentorProfile")
    .select(
      "id, userId, fonction, organisation, anneesExperience, expertises, secteurs, langues, typesMentoring, disponibilites, biographie, photoUrl, isAvailable, user:User!userId (id, nom, prenom, pays)"
    )
    .eq("statutValidation", "ACTIVE")
    .order("isAvailable", { ascending: false })
    .order("anneesExperience", { ascending: false });

  const rawMentors = (data as PublicMentorCardRow[] | null) ?? [];
  const mentors: MentorSearchResultItem[] = rawMentors.map((mentor) => {
    const userObj = Array.isArray(mentor.user)
      ? mentor.user[0]
      : mentor.user;
    return {
      id: mentor.id,
      userId: mentor.userId,
      fonction: mentor.fonction ?? "",
      organisation: mentor.organisation ?? null,
      anneesExperience: mentor.anneesExperience ?? 0,
      expertises: mentor.expertises ?? [],
      secteurs: mentor.secteurs ?? [],
      langues: mentor.langues ?? [],
      typesMentoring: mentor.typesMentoring ?? "INDIVIDUEL",
      disponibilites: mentor.disponibilites ?? null,
      biographie: mentor.biographie ?? null,
      photoUrl: mentor.photoUrl ?? null,
      isAvailable: Boolean(mentor.isAvailable),
      user: userObj
        ? {
            id: userObj.id ?? mentor.userId,
            nom: userObj.nom,
            prenom: userObj.prenom,
            pays: userObj.pays,
          }
        : null,
    };
  });

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
