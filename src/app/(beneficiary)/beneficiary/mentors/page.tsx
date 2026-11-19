import type { Metadata } from "next";
import Link from "next/link";
import { Users, Award, Briefcase, MapPin, ArrowRight } from "lucide-react";
import { getActiveMentorsCatalogAction } from "@/lib/actions/beneficiary";
import { ROUTES } from "@/lib/constants";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";

export const metadata: Metadata = {
  title: "Annuaire des Mentors | Espace Bénéficiaire ACCEENT Mentoring",
  description: "Explorez les profils réels des mentors certifiés disponibles sur la plateforme.",
};

export default async function BeneficiaryMentorsCatalogPage() {
  const mentors = await getActiveMentorsCatalogAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Annuaire des Mentors Certifiés
          </h1>
          <p className="text-sm text-muted-foreground">
            {mentors.length} mentor(s) actif(s) et validé(s) pour vous accompagner.
          </p>
        </div>

        <Link
          href={ROUTES.BENEFICIARY.DIAGNOSIS}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors self-start sm:self-auto"
        >
          Refaire mon diagnostic (F04)
        </Link>
      </div>

      {mentors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucun mentor disponible pour le moment
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les mentors certifiés validés par l&apos;équipe administrative apparaîtront automatiquement ici dès leur activation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor) => {
            const fullName = `${mentor.prenom} ${mentor.nom}`.trim() || "Mentor ACCEENT";
            const initials = `${mentor.prenom?.[0] || ""}${mentor.nom?.[0] || "M"}`.toUpperCase();
            const safePhotoUrl = sanitizeExternalUrl(mentor.photoUrl);

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Visuel portrait agrandi */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden shrink-0">
                  {safePhotoUrl ? (
                    <img
                      src={safePhotoUrl}
                      alt={fullName}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-primary/85 text-white font-bold text-3xl flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs backdrop-blur-xs ${
                      mentor.isAvailable
                        ? "bg-emerald-50/95 text-emerald-700 border border-emerald-200/80"
                        : "bg-slate-100/95 text-slate-700 border border-slate-200/80"
                    }`}
                  >
                    {mentor.isAvailable ? "Disponible" : "Indisponible"}
                  </span>
                </div>

                {/* Contenu de la carte */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h2 className="text-base font-bold text-foreground truncate">
                          {fullName}
                        </h2>
                        <Award className="h-4 w-4 text-secondary shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {mentor.fonction}
                          {mentor.organisation ? ` · ${mentor.organisation}` : ""}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        <span>{mentor.anneesExperience} ans d&apos;exp.</span>
                        {mentor.pays && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mentor.pays}
                          </span>
                        )}
                      </div>
                    </div>

                    {mentor.biographie && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {mentor.biographie}
                      </p>
                    )}

                    {mentor.expertises.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mentor.expertises.slice(0, 4).map((exp, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href={ROUTES.BENEFICIARY.MENTOR_DETAIL(mentor.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <span>Voir le profil mentor</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
