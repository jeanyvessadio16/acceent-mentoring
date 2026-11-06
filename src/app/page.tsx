import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/shared/Logo';
import {
  Compass,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Award,
  Star,
} from 'lucide-react';
import { MentorCard } from '@/components/shared/MentorCard';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { MentorProfile, OpportunityItem } from '@/types';

const FEATURED_MENTORS: MentorProfile[] = [
  {
    id: 'm1',
    firstName: 'Awa',
    lastName: 'Ndiaye',
    email: 'awa.ndiaye@exemple.sn',
    role: 'MENTOR',
    status: 'ACTIVE',
    country: 'Sénégal',
    city: 'Dakar',
    title: 'Lead Software Architect & Tech Advisor',
    company: 'Sonatel & Africa Fintech Forum',
    experienceYears: 12,
    sectors: ['Tech & Digital', 'Fintech'],
    targetAudiences: ['Jeunes diplômés', 'Entrepreneurs'],
    mentoringTypes: ['INDIVIDUAL'],
    rating: 4.9,
    reviewCount: 28,
    isAvailable: true,
    validationStatus: 'APPROVED',
    skills: ['Architecture Cloud', 'TypeScript', 'Systèmes Distribués', 'Leadership Tech'],
    interests: ['Inclusion numérique', 'Open Source'],
    languages: ['Français', 'Wolof', 'Anglais'],
    bio: 'Passionnée par l’émergence technologique africaine, j’aide les jeunes développeurs et porteurs de projets à bâtir des systèmes résilients et scalables.',
    createdAt: '2025-01-10',
    updatedAt: '2026-02-15',
  },
  {
    id: 'm2',
    firstName: 'Moussa',
    lastName: 'Sow',
    email: 'moussa.sow@exemple.sn',
    role: 'MENTOR',
    status: 'ACTIVE',
    country: 'Sénégal',
    city: 'Saint-Louis',
    title: 'Directeur d’Incubateur & Serial Entrepreneur',
    company: 'Sahel Innov Hub',
    experienceYears: 15,
    sectors: ['Entrepreneuriat', 'Agrobusiness'],
    targetAudiences: ['Startups', 'Porteurs de projet'],
    mentoringTypes: ['INDIVIDUAL', 'GROUP'],
    rating: 4.8,
    reviewCount: 35,
    isAvailable: true,
    validationStatus: 'APPROVED',
    skills: ['Modèle Économique', 'Levée de fonds', 'Stratégie Go-to-Market', 'Négociation'],
    interests: ['Innovation rurale', 'Entrepreneuriat vert'],
    languages: ['Français', 'Pulaar', 'Anglais'],
    bio: 'J’accompagne la nouvelle génération d’entrepreneurs à structurer leurs projets, valider leur marché et attirer des investisseurs.',
    createdAt: '2025-01-15',
    updatedAt: '2026-02-20',
  },
  {
    id: 'm3',
    firstName: 'Aminata',
    lastName: 'Diallo',
    email: 'aminata.diallo@exemple.sn',
    role: 'EXPERT',
    status: 'ACTIVE',
    country: 'Côte d’Ivoire',
    city: 'Abidjan',
    title: 'Head of People & Talent Acquisition',
    company: 'Orange Côte d’Ivoire',
    experienceYears: 10,
    sectors: ['Ressources Humaines', 'Leadership'],
    targetAudiences: ['Cadres', 'Jeunes professionnels'],
    mentoringTypes: ['INDIVIDUAL'],
    rating: 5.0,
    reviewCount: 19,
    isAvailable: true,
    validationStatus: 'APPROVED',
    skills: ['Développement de Carrière', 'Personal Branding', 'Gestion des Talents', 'Prise de parole'],
    interests: ['Leadership féminin', 'Coaching'],
    languages: ['Français', 'Anglais'],
    bio: 'Experte en dynamique des talents, j’aide les professionnels à clarifier leur positionnement et à franchir des paliers décisifs de carrière.',
    createdAt: '2025-02-01',
    updatedAt: '2026-03-01',
  },
];

const FEATURED_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'op1',
    title: 'Programme d’Accélération Tech & Climat 2026',
    organization: 'Dakar Innovation Seed',
    location: 'Dakar, Sénégal (Hybride)',
    category: 'FINANCEMENT',
    deadline: '2026-12-15',
    description: 'Bourse d’amorçage de 15 000 000 FCFA accompagnée d’un mentoring stratégique de 6 mois pour les startups à impact.',
    isExpired: false,
  },
  {
    id: 'op2',
    title: 'Stage Ingénieur Frontend Next.js / TypeScript',
    organization: 'FinTech Wave Labs',
    location: 'Dakar / Télétravail',
    category: 'STAGE',
    deadline: '2026-11-30',
    description: 'Immersion au sein d’une équipe produit senior pour développer les interfaces web d’un système de paiement panafricain.',
    isExpired: false,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-radial from-brand-accent/20 via-background to-background py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Colonne gauche : Titre, description, CTAs & stats */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Propulsez votre trajectoire avec les meilleurs mentors du{' '}
                  <span className="text-brand-primary underline decoration-brand-accent/50 underline-offset-4">
                    Sénégal
                  </span>{' '}
                  et d'Afrique
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  ACCEENT connecte les talents ambitieux à un écosystème structuré de mentors certifiés, de masterclasses d'élite et d'opportunités professionnelles concrètes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start items-center pt-2">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white shadow-md text-sm px-7">
                    <Link href="/diagnostic" className="flex items-center justify-center gap-2">
                      Faire mon diagnostic
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 hover:text-brand-primary">
                    <Link href="/mentors" className="flex items-center justify-center gap-2">
                      Explorer les mentors
                    </Link>
                  </Button>
                </div>

                {/* Statistiques clés d'impact */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-border/60">
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary">1 200+</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mentorés accompagnés</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary">250+</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mentors validés</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary">94%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Taux de satisfaction</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary">500+</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Opportunités</p>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Photographie authentique d'un mentor et mentoré sénégalais */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                {/* Lueur d'arrière-plan */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20 rounded-3xl blur-2xl -z-10" />

                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Cadre de l'image */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-background">
                    <Image
                      src="/images/hero-mentoring-senegal.jpg"
                      alt="Session de mentoring d'excellence entre un mentor et un mentoré sénégalais"
                      width={800}
                      height={800}
                      priority
                      className="w-full h-auto object-cover aspect-square"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm font-medium text-white/95 mt-0.5">
                        Accompagnement personnalisé pour booster votre impact professionnel
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARCOURS STRUCTURÉ ACCEENT */}
        <section className="py-16 bg-brand-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Un accompagnement structuré, de l'évaluation à l'impact
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                La plateforme ne se limite pas à un simple annuaire : elle encadre votre progression étape par étape.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Profil & Diagnostic',
                  desc: 'Évaluez vos compétences, vos objectifs prioritaires et vos besoins réels.',
                  icon: Compass,
                },
                {
                  step: '02',
                  title: 'Matching Précis',
                  desc: 'Accédez à des recommandations de mentors fondées sur vos objectifs précis.',
                  icon: Users,
                },
                {
                  step: '03',
                  title: 'Feuille de Route',
                  desc: 'Co-construisez un plan d’action avec des jalons, des sessions et des tâches.',
                  icon: Target,
                },
                {
                  step: '04',
                  title: 'Opportunités & Impact',
                  desc: 'Valorisez vos compétences et débloquez stages, financements et emplois.',
                  icon: Award,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="border-border bg-card shadow-xs relative overflow-hidden">
                    <div className="absolute top-3 right-4 text-3xl font-black text-muted/30">
                      {item.step}
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION MENTORS RECOMMANDÉS */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Découvrez nos mentors d’exception
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Des leaders expérimentés prêts à partager leur expertise pour vous faire grandir.
              </p>
            </div>
            <Button variant="ghost" asChild className="text-brand-primary hover:text-brand-secondary font-semibold text-xs">
              <Link href="/mentors" className="flex items-center gap-1">
                Voir tout l’annuaire
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_MENTORS.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </section>

        {/* SECTION OPPORTUNITY HUB & MASTERCLASSES */}
        <section className="py-16 bg-brand-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Des opportunités concrètes sélectionnées pour vous
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Financements, bourses, concours et stages qualifiés pour booster votre avenir.
                </p>
              </div>
              <Button variant="ghost" asChild className="text-brand-primary hover:text-brand-secondary font-semibold text-xs">
                <Link href="/opportunites" className="flex items-center gap-1">
                  Explorer toutes les offres
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURED_OPPORTUNITIES.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        </section>

        {/* BANNIÈRE DEVENIR MENTOR / CALL TO ACTION */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs uppercase font-semibold">
              Engagement & Transmission
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Vous avez une expertise ? Devenez mentor sur ACCEENT
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              Rejoignez une communauté bienveillante de professionnels chevronnés et contribuez activement au développement des leaders de demain en Afrique.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-brand-primary hover:bg-white/90 font-semibold text-sm">
                <Link href="/devenir-mentor">
                  Déposer ma candidature de mentor
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
