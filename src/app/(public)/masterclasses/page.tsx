import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Calendar,
  Clock,
  GraduationCap,
  Lock,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { apiRequest } from "@/lib/api/server-client";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Masterclasses | ACCEENT Mentoring",
  description:
    "Découvrez le calendrier des masterclasses et ateliers pratiques animés par nos mentors et experts.",
};

interface PublicMasterclassCard {
  id: string;
  titre: string;
  intervenant: string;
  description: string;
  categorie: string;
  dateSession: string;
  duree: number;
  statut: string;
  maxParticipants: number | null;
}

export default async function PublicMasterclassesCatalogPage() {
  await connection();
  const res = await apiRequest<{ data: PublicMasterclassCard[] }>(
    "/masterclasses",
    {
      auth: false,
      query: { limit: 50 },
    }
  );

  const masterclasses = res.data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête catalogue */}
      <section className="bg-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Ateliers &amp; conférences d&apos;experts
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Nos Masterclasses
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Montez en compétences grâce à des sessions interactives animées
              par des leaders et praticiens chevronnés. L&apos;accès aux liens
              de diffusion est réservé aux membres connectés.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <span>Se connecter</span>
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-accent text-slate-950 hover:bg-accent/90 transition-colors"
            >
              <span>S&apos;inscrire gratuitement</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grille des masterclasses */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {masterclasses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-4">
            <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Aucune masterclass programmée pour le moment
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Créez votre compte membre pour être informé dès l&apos;ouverture
                des prochaines sessions thématiques.
              </p>
            </div>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span>Rejoindre la communauté</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterclasses.map((mc) => {
              const formattedDate = mc.dateSession
                ? new Date(mc.dateSession).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Date à confirmer";

              return (
                <article
                  key={mc.id}
                  className="bg-white rounded-3xl border border-border shadow-xs p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                        {mc.categorie}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {mc.statut}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-foreground">
                      {mc.titre}
                    </h2>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Animée par {mc.intervenant}</span>
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {mc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {mc.duree} min
                      </span>
                      {mc.maxParticipants && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {mc.maxParticipants} places
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/70">
                    <Link
                      href={`${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(
                        ROUTES.MASTERCLASSES_CATALOG
                      )}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Connexion requise pour accéder au live</span>
                    </Link>
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
