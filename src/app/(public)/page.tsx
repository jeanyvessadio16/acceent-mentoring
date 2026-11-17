import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Users,
  Target,
  BookOpen,
  Briefcase,
  Star,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

// --- Données statiques validées par le projet ---

const STATS = [
  { value: "500+", label: "Mentors experts" },
  { value: "2 000+", label: "Bénéficiaires accompagnés" },
  { value: "15+", label: "Secteurs représentés" },
  { value: "8 pays", label: "Présence en Afrique" },
];

const PILLARS = [
  {
    icon: Users,
    title: "Mentoring individuel & collectif",
    description:
      "Sessions one-to-one ou en groupe avec des professionnels chevronnés adaptés à votre profil et vos objectifs.",
    color: "bg-primary/8 text-primary",
  },
  {
    icon: Target,
    title: "Diagnostic & Matching intelligent",
    description:
      "Un questionnaire de diagnostic personnalisé pour identifier vos besoins et vous recommander les mentors les plus pertinents.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: BookOpen,
    title: "Masterclasses & formations",
    description:
      "Des événements animés par des experts et dirigeants pour approfondir vos compétences et élargir vos horizons.",
    color: "bg-accent/15 text-amber-700",
  },
  {
    icon: Briefcase,
    title: "Opportunités & partenariats",
    description:
      "Accédez à des offres d'emploi, stages, appels à projets, financements et événements sélectionnés pour votre parcours.",
    color: "bg-info/10 text-info",
  },
];

const AUDIENCE_CARDS = [
  {
    title: "Jeunes & Étudiants",
    description:
      "Orientez votre parcours, développez vos compétences et intégrez le monde professionnel avec l'appui d'un mentor.",
    cta: "Commencer mon parcours",
    href: ROUTES.AUTH.REGISTER,
  },
  {
    title: "Femmes entrepreneures",
    description:
      "Accédez à un réseau de mentorat dédié pour lancer et consolider votre projet entrepreneurial.",
    cta: "Rejoindre la plateforme",
    href: ROUTES.AUTH.REGISTER,
  },
  {
    title: "Professionnels & Experts",
    description:
      "Devenez mentor et transmettez votre expertise tout en élargissant votre réseau de haut niveau.",
    cta: "Devenir mentor",
    href: ROUTES.MENTOR.APPLICATION,
  },
  {
    title: "Porteurs de projets",
    description:
      "Structurez votre idée, identifiez des opportunités et entourez-vous des bons partenaires pour réussir.",
    cta: "Démarrer mon projet",
    href: ROUTES.AUTH.REGISTER,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Créez votre profil",
    description: "Inscrivez-vous et renseignez votre parcours, vos objectifs et vos besoins en quelques minutes.",
    icon: Users,
  },
  {
    step: "02",
    title: "Passez le diagnostic",
    description: "Un questionnaire ciblé analyse votre situation et identifie les mentors les plus adaptés.",
    icon: Target,
  },
  {
    step: "03",
    title: "Choisissez votre mentor",
    description: "Consultez les profils recommandés, explorez leurs expertises et envoyez votre demande.",
    icon: Star,
  },
  {
    step: "04",
    title: "Démarrez votre parcours",
    description: "Planifiez vos sessions, suivez vos objectifs et progressez avec un accompagnement structuré.",
    icon: TrendingUp,
  },
];

// --- Composants internes de la page ---

function HeroSection() {
  return (
    <section
      aria-label="Présentation de la plateforme"
      className="relative overflow-hidden bg-primary text-white"
    >
      {/* Dégradés décoratifs */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 80% at 0% 50%, #159B78 0%, transparent 55%), radial-gradient(ellipse 40% 60% at 10% 90%, #F2A541 0%, transparent 45%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Colonne texte */}
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-tight tracking-tight mb-6">
              Accélérez votre parcours{" "}
              <span className="text-secondary">avec les bons mentors</span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-10">
              ACCEENT connecte jeunes, femmes, professionnels et entrepreneurs avec des
              mentors experts, des masterclasses et des opportunités pour réussir en Afrique
              et à l'international.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3.5 text-sm font-semibold text-white hover:bg-secondary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={ROUTES.MENTORS_CATALOG}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Explorer les mentors
              </Link>
            </div>
          </div>

          {/* Colonne image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <Image
                src="/images/Mentorat_image.png"
                alt="Un mentor accompagne une bénéficiaire lors d'une session de travail"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section aria-label="Chiffres clés" className="bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="text-3xl font-extrabold text-primary">{stat.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PillarsSection() {
  return (
    <section aria-labelledby="pillars-heading" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            id="pillars-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary mb-4"
          >
            Un écosystème complet d'accompagnement
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bien plus qu'un annuaire de mentors — une plateforme intégrée autour de votre
            réussite professionnelle et entrepreneuriale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg mb-4 ${pillar.color}`}
                  aria-hidden
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section aria-labelledby="how-heading" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            id="how-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary mb-4"
          >
            Comment ça fonctionne ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Un processus structuré pour trouver le bon accompagnement et progresser
            efficacement.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.step} className="relative">
                {/* Connecteur horizontal (desktop) */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden lg:block absolute top-7 left-[calc(100%-0px)] w-full h-px bg-border -translate-y-1/2 z-0"
                    style={{ width: "calc(100% - 3.5rem)", left: "3.5rem" }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <span className="text-3xl font-black text-primary/15 select-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="text-center mt-12">
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Créer mon compte gratuit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section aria-labelledby="audience-heading" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            id="audience-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary mb-4"
          >
            La plateforme faite pour vous
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Quelle que soit votre situation, ACCEENT vous propose un accompagnement
            personnalisé.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {AUDIENCE_CARDS.map((card) => (
            <div
              key={card.title}
              className="group bg-card rounded-xl border border-border p-7 hover:border-secondary/50 hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-foreground text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {card.description}
              </p>
              <Link
                href={card.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors group-hover:gap-3"
              >
                {card.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesHighlight() {
  const features = [
    { icon: MessageSquare, text: "Messagerie directe avec votre mentor" },
    { icon: Calendar, text: "Prise de rendez-vous intégrée" },
    { icon: Target, text: "Suivi de parcours et d'objectifs" },
    { icon: CheckCircle, text: "Mentors validés et vérifiés" },
    { icon: BookOpen, text: "Accès aux masterclasses en replay" },
    { icon: Briefcase, text: "Opportunités filtrées selon votre profil" },
  ];

  return (
    <section aria-labelledby="features-heading" className="py-20 bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight"
            >
              Tout ce qu'il vous faut pour{" "}
              <span className="text-secondary">réussir votre accompagnement</span>
            </h2>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              Des outils concrets intégrés directement dans la plateforme pour suivre vos
              progrès, communiquer avec votre mentor et saisir vos opportunités.
            </p>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3.5 text-sm font-semibold text-white hover:bg-secondary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Commencer maintenant
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.text}
                  className="flex items-center gap-3 bg-white/8 rounded-lg px-4 py-3.5"
                >
                  <Icon className="h-5 w-5 text-secondary shrink-0" aria-hidden />
                  <span className="text-sm font-medium text-white/90">{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div
          aria-hidden
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary mb-6 mx-auto"
        >
          <Star className="h-7 w-7" />
        </div>
        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl font-extrabold text-primary mb-4"
        >
          Prêt à transformer votre parcours ?
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Rejoignez des milliers de bénéficiaires et de mentors qui bâtissent ensemble
          l'Afrique de demain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-4 text-sm font-semibold text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Créer mon compte gratuitement
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={ROUTES.MENTOR.APPLICATION}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-7 py-4 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Devenir mentor
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- Page principale ---

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PillarsSection />
      <HowItWorksSection />
      <AudienceSection />
      <FeaturesHighlight />
      <CtaSection />
    </>
  );
}
