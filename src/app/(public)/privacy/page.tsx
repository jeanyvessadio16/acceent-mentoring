import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, RefreshCw, Trash2, Mail } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Protection des Données & Consentement | ACCEENT Mentoring",
  description:
    "Engagement relatif à la protection de la vie privée, traitement des données personnelles et exercice de vos droits.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation retour */}
        <div className="mb-8">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>

        {/* En-tête */}
        <header className="mb-10 pb-8 border-b border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-4">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span>Conformité Loi 2008-12 (Sénégal - CDP) & Standards Internationaux</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-4">
            Politique de Confidentialité & Consentement Données Personnelles
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Chez ACCEENT Mentoring, la protection de vos données personnelles et le respect de votre vie privée constituent un engagement fondamental. Cette politique vous informe de la manière dont vos données sont collectées, traitées et protégées.
          </p>
        </header>

        {/* Corps du document */}
        <div className="space-y-10 text-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1 : Cadre légal */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
              Cadre Réglementaire & Responsable du Traitement
            </h2>
            <p>
              Le traitement des données à caractère personnel mis en œuvre sur la plateforme est conforme à la <strong>loi sénégalaise n° 2008-12 du 25 janvier 2008</strong> portant sur la protection des données à caractère personnel, supervisée par la <strong>Commission des Données Personnelles (CDP)</strong> du Sénégal, ainsi qu&apos;aux meilleurs standards internationaux de transparence.
            </p>
          </section>

          {/* Section 2 : Données collectées */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
              Données Collectées et Nature des Informations
            </h2>
            <p>Nous ne collectons que les données strictement nécessaires au fonctionnement de la plateforme :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <p className="font-semibold text-primary text-sm flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-secondary" aria-hidden />
                  Données d&apos;identification
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prénom, nom, adresse email professionnelle ou personnelle, numéro de téléphone, pays et ville de résidence.
                </p>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <p className="font-semibold text-primary text-sm flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-accent" aria-hidden />
                  Données de profil & parcours
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Formation, expériences, compétences, centres d&apos;intérêt, projet entrepreneurial, CV et justificatifs (pour les mentors).
                </p>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <p className="font-semibold text-primary text-sm flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-info" aria-hidden />
                  Diagnostic & Préférences de matching
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Réponses au questionnaire de diagnostic, objectifs prioritaires, disponibilités horaires et format d&apos;accompagnement souhaité.
                </p>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <p className="font-semibold text-primary text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
                  Données de connexion & sécurité
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mots de passe chiffrés (hash sécurisé), horodatage des connexions et consentements légaux enregistrés.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 : Finalités du traitement */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
              Finalités du Traitement
            </h2>
            <p>Vos données sont traitées pour des objectifs précis et légitimes :</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
              <li>Mise en relation optimale entre bénéficiaires et mentors via l&apos;algorithme de matching explicable.</li>
              <li>Gestion et planification des séances de mentoring et notifications de rappel.</li>
              <li>Partage d&apos;opportunités d&apos;emploi, de stages, d&apos;appels à projets et de masterclasses adaptées à vos besoins.</li>
              <li>Mesure d&apos;impact global et statistiques de la plateforme (données strictement agrégées et anonymisées).</li>
              <li>Sécurisation des accès et prévention des fraudes.</li>
            </ul>
          </section>

          {/* Section 4 : Données publiques vs privées */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
              Gestion des Données Publiques et Privées
            </h2>
            <p>
              Chaque utilisateur garde le contrôle total sur la visibilité de ses informations :
            </p>
            <div className="bg-card p-4 rounded-xl border border-border text-sm space-y-2">
              <p>
                <strong>Profil public :</strong> Les éléments visibles dans l&apos;annuaire (pour les mentors validés) comprennent le nom, la fonction, la biographie, les domaines d&apos;expertise et la disponibilité générale.
              </p>
              <p>
                <strong>Données strictement privées :</strong> Votre adresse email, numéro de téléphone, mot de passe et l&apos;historique de vos messages confidentiels ne sont jamais divulgués au public.
              </p>
            </div>
          </section>

          {/* Section 5 : Vos droits */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span>
              Vos Droits et Modalités d&apos;Exercice
            </h2>
            <p>
              Conformément à la législation en vigueur, vous disposez des droits suivants à tout moment :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-secondary" aria-hidden />
                  Droit d&apos;accès & rectification
                </p>
                <p className="text-muted-foreground">Consulter et modifier directement vos informations depuis votre profil.</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden />
                  Droit à l&apos;effacement
                </p>
                <p className="text-muted-foreground">Demander la suppression complète et définitive de votre compte utilisateur.</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 text-info" aria-hidden />
                  Droit d&apos;export (portabilité)
                </p>
                <p className="text-muted-foreground">Télécharger une copie de vos données personnelles dans un format standard (CSV/JSON).</p>
              </div>
            </div>
          </section>

          {/* Section 6 : Sécurité & contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">6</span>
              Sécurité et Contact du Délégué à la Protection des Données
            </h2>
            <p>
              Toutes les communications transitent via le protocole sécurisé <strong>HTTPS</strong> avec chiffrement des données au repos et en transit.
            </p>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-primary">Pour exercer vos droits ou pour toute question :</p>
                <p className="text-xs text-muted-foreground">Contactez notre équipe de protection des données :</p>
              </div>
              <a
                href="mailto:protection-donnees@acceent-mentoring.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-white px-3.5 py-2 rounded-lg border border-primary/20 shadow-sm hover:bg-primary/5 transition-colors"
              >
                <Mail className="h-4 w-4 text-secondary" aria-hidden />
                protection-donnees@acceent-mentoring.com
              </a>
            </div>
          </section>
        </div>

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            ← Retour au formulaire d&apos;inscription
          </Link>
          <Link
            href={ROUTES.LEGAL.CGU}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Consulter les CGU →
          </Link>
        </div>
      </div>
    </div>
  );
}
