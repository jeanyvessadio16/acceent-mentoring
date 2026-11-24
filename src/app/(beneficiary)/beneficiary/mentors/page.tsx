import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";

import { getActiveMentorsCatalogAction } from "@/lib/actions/beneficiary";
import { MentorsFilterableCatalog } from "@/features/mentors/MentorsFilterableCatalog";
import { ROUTES } from "@/lib/constants";
import type { MentorSearchResultItem } from "@/lib/actions/mentoring";

export const instant = false;

export const metadata: Metadata = {
  title: "Catalogue des Mentors | Espace Bénéficiaire ACCEENT Mentoring",
  description:
    "Recherchez et filtrez les mentors disponibles par secteur, expertise, pays, langue et format d'accompagnement.",
};

export default async function BeneficiaryMentorsPage() {
  const catalog = await getActiveMentorsCatalogAction();
  const initialMentors: MentorSearchResultItem[] = catalog.map((m) => ({
    id: m.id,
    userId: m.userId,
    nom: m.nom,
    prenom: m.prenom,
    pays: m.pays,
    fonction: m.fonction,
    organisation: m.organisation,
    anneesExperience: m.anneesExperience,
    expertises: m.expertises,
    secteurs: m.secteurs,
    langues: m.langues,
    typesMentoring: m.typesMentoring,
    disponibilites: m.disponibilites,
    biographie: m.biographie,
    photoUrl: m.photoUrl,
    isAvailable: m.isAvailable,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/beneficiaire"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Catalogue des Mentors
          </h1>
          <p className="text-sm text-muted-foreground">
            Filtrez les mentors disponibles par expertise, secteur, pays ou
            format pour lancer votre demande de mentoring.
          </p>
        </div>

        <Link
          href={ROUTES.BENEFICIARY.PARCOURS}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors self-start sm:self-auto"
        >
          <Route className="h-3.5 w-3.5" />
          <span>Voir mes demandes &amp; parcours</span>
        </Link>
      </div>

      <MentorsFilterableCatalog
        initialMentors={initialMentors}
        mode="beneficiary"
      />
    </div>
  );
}
