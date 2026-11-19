import Link from "next/link";
import { ArrowLeft, CheckCircle, Scale } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Conditions Générales d'Utilisation (CGU) | ACCEENT Mentoring",
  description:
    "Conditions générales d'utilisation régissant l'accès et l'usage de la plateforme digitale de mentoring ACCEENT.",
};

export default function CGUPage() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* En-tête navigation */}
        <div className="mb-8">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>

        {/* Titre et préambule */}
        <header className="mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            <span>Document contractuel officiel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-4">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Dernière mise à jour : <strong>Septembre 2026</strong>. Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme de mentoring et d&apos;opportunités ACCEENT.
          </p>
        </header>

        {/* Contenu textuel structuré */}
        <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
          {/* Article 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
              Objet de la Plateforme
            </h2>
            <p>
              La plateforme digitale <strong>ACCEENT Mentoring</strong> a pour objet de mettre en relation des jeunes, des femmes entrepreneures, des professionnels et des porteurs de projets (les « <strong>Bénéficiaires</strong> ») avec des mentors, des dirigeants et des experts bénévoles ou accrédités (les « <strong>Mentors</strong> »).
            </p>
            <p>
              La plateforme constitue un écosystème d&apos;accompagnement intégrant du mentoring individuel et collectif, un diagnostic de besoins, un moteur de matching, des masterclasses, ainsi qu&apos;un catalogue d&apos;opportunités professionnelles.
            </p>
          </section>

          {/* Article 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
              Accès et Inscription
            </h2>
            <p>
              L&apos;accès à la plateforme requiert la création préalable d&apos;un compte personnel. L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription.
            </p>
            <div className="bg-card p-4 rounded-xl border border-border space-y-2">
              <p className="font-semibold text-primary">Types de profils utilisateurs :</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Bénéficiaire :</strong> Accès au diagnostic, recherche de mentors, demandes d&apos;accompagnement et événements.</li>
                <li><strong>Mentor :</strong> Accompagnement dans la durée. L&apos;activation du profil est subordonnée à une <em>validation administrative préalable</em>.</li>
                <li><strong>Expert :</strong> Interventions ciblées et masterclasses. Profil également soumis à validation administrative.</li>
                <li><strong>Partenaire :</strong> Institutions ou entreprises soutenant des programmes ou proposant des opportunités.</li>
              </ul>
            </div>
          </section>

          {/* Article 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
              Charte Déontologique du Mentoring
            </h2>
            <p>
              La relation entre mentor et bénéficiaire repose sur la bienveillance, la confidentialité, le respect mutuel et l&apos;engagement :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <div className="text-xs">
                  <strong className="text-foreground block mb-0.5">Assiduité & Ponctualité</strong>
                  Respecter les créneaux de rendez-vous convenus et prévenir au moins 24h à l&apos;avance en cas d&apos;empêchement.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <div className="text-xs">
                  <strong className="text-foreground block mb-0.5">Confidentialité absolue</strong>
                  Les échanges, projets et documents partagés lors des sessions sont strictement confidentiels.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <div className="text-xs">
                  <strong className="text-foreground block mb-0.5">Non-lucrativité du mentoring</strong>
                  Le mentor agit à titre bénévole dans le cadre du mentoring MVP et ne peut exiger de rétribution financière directe du mentoré.
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <div className="text-xs">
                  <strong className="text-foreground block mb-0.5">Absence de lien hiérarchique</strong>
                  Le mentor conseille et oriente, mais ne se substitue pas aux décisions du porteur de projet.
                </div>
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
              Messagerie et Règles d&apos;Usage
            </h2>
            <p>
              La messagerie interne est exclusivement réservée aux échanges professionnels liés au parcours d&apos;accompagnement. Tout propos injurieux, diffamatoire, discriminatoire, ou constituant du démarchage non sollicité (spam) entraîne la suspension immédiate du compte de l&apos;auteur.
            </p>
          </section>

          {/* Article 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span>
              Modération et Suspension de Compte
            </h2>
            <p>
              L&apos;équipe d&apos;administration d&apos;ACCEENT se réserve le droit de refuser, suspendre temporairement ou supprimer définitivement l&apos;accès à tout utilisateur ne respectant pas les présentes CGU ou signalant un comportement abusif.
            </p>
          </section>

          {/* Article 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">6</span>
              Droit Applicable et Juridiction
            </h2>
            <p>
              Les présentes CGU sont régies par le droit en vigueur en République du Sénégal et les dispositions communautaires applicables de l&apos;OHADA. En cas de litige, les parties s&apos;engagent à rechercher prioritairement une solution amiable avant toute action judiciaire.
            </p>
          </section>
        </div>

        {/* Pied de page CGU */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            ← Retour au formulaire d&apos;inscription
          </Link>
          <Link
            href={ROUTES.LEGAL.PRIVACY}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Consulter la Politique de Confidentialité →
          </Link>
        </div>
      </div>
    </div>
  );
}
