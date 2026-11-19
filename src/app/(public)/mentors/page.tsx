import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const instant = false;

export const metadata: Metadata = {
  title: "Catalogue des Mentors | ACCEENT Mentoring",
  description:
    "Découvrez les mentors certifiés et experts de la communauté ACCEENT disponibles pour accompagner vos projets en Afrique et dans la diaspora.",
};

interface PublicMentorCard {
  id: string;
  fonction: string;
  organisation: string | null;
  anneesExperience: number | null;
  expertises: string[] | null;
  secteurs: string[] | null;
  langues: string[] | null;
  typesMentoring: string | null;
  biographie: string | null;
  photoUrl: string | null;
  isAvailable: boolean;
  user:
    | {
        nom: string;
        prenom: string;
        pays: string | null;
      }
    | Array<{
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
      "id, fonction, organisation, anneesExperience, expertises, secteurs, langues, typesMentoring, biographie, photoUrl, isAvailable, user:User!userId (nom, prenom, pays)"
    )
    .eq("statutValidation", "ACTIVE")
    .order("isAvailable", { ascending: false })
    .order("anneesExperience", { ascending: false });

  const mentors = (data as PublicMentorCard[] | null) ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête catalogue */}
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

      {/* Grille des mentors */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {mentors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-4">
            <Users className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Aucun mentor disponible pour le moment
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                De nouveaux mentors sont en cours de validation par notre équipe
                pédagogique. Créez votre compte pour être notifié dès leur
                activation.
              </p>
            </div>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => {
              const userObj = Array.isArray(mentor.user)
                ? mentor.user[0]
                : mentor.user;
              const fullName = userObj
                ? `${userObj.prenom} ${userObj.nom}`.trim()
                : "Mentor ACCEENT";
              const initials = userObj
                ? `${userObj.prenom?.[0] || ""}${userObj.nom?.[0] || "M"}`.toUpperCase()
                : "M";
              const safePhotoUrl = sanitizeExternalUrl(mentor.photoUrl);
              const expertises = mentor.expertises ?? [];
              const langues = mentor.langues ?? [];

              return (
                <article
                  key={mentor.id}
                  className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition-all"
                >
                  {/* Visuel portrait agrandi */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden shrink-0">
                    {safePhotoUrl ? (
                      <img
                        src={safePhotoUrl}
                        alt={fullName}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-4xl flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs backdrop-blur-xs ${
                        mentor.isAvailable
                          ? "bg-emerald-50/95 text-emerald-700 border border-emerald-200/80"
                          : "bg-slate-100/95 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      {mentor.isAvailable
                        ? "Disponible"
                        : "Temporairement indisponible"}
                    </span>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-foreground truncate">
                          {fullName}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            {mentor.fonction}
                            {mentor.organisation
                              ? ` · ${mentor.organisation}`
                              : ""}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                          {userObj?.pays && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {userObj.pays}
                            </span>
                          )}
                          {typeof mentor.anneesExperience === "number" && (
                            <span className="inline-flex items-center gap-1">
                              <Award className="h-3 w-3 text-secondary" />
                              {mentor.anneesExperience} ans d&apos;exp.
                            </span>
                          )}
                        </div>
                      </div>

                      {mentor.biographie && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {mentor.biographie}
                        </p>
                      )}

                      {expertises.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {expertises.slice(0, 4).map((exp) => (
                            <span
                              key={exp}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/8 text-primary"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}

                      {langues.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span>{langues.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-secondary">
                        {mentor.typesMentoring === "COLLECTIF"
                          ? "Mentoring collectif"
                          : mentor.typesMentoring === "LES_DEUX"
                          ? "Individuel & Collectif"
                          : "Mentoring individuel"}
                      </span>
                      <Link
                        href={`/mentors/${mentor.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <span>Voir le profil</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
