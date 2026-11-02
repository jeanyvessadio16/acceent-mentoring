'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MentoringRequestModal } from '@/features/mentoring-requests/MentoringRequestModal';
import { MentorProfile } from '@/types';
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Globe,
  Award
} from 'lucide-react';

const MOCK_MENTOR: MentorProfile = {
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
  sectors: ['Tech & Digital', 'Fintech', 'Cloud Computing'],
  targetAudiences: ['Jeunes diplômés', 'Entrepreneurs tech', 'Développeurs seniors'],
  mentoringTypes: ['INDIVIDUAL', 'GROUP'],
  rating: 4.9,
  reviewCount: 28,
  isAvailable: true,
  validationStatus: 'APPROVED',
  skills: [
    'Architecture Cloud',
    'Next.js & React',
    'Systèmes Distribués',
    'Gouvernance Données',
    'Mentoring & Leadership',
    'Cybersécurité'
  ],
  interests: ['Inclusion numérique', 'Femmes dans la tech', 'Open Source africain'],
  languages: ['Français', 'Wolof', 'Anglais'],
  bio: 'Passionnée par l’émergence technologique africaine, j’aide les jeunes développeurs et porteurs de projets à bâtir des systèmes résilients, performants et scalables. Forte de 12 années d’expérience sur des infrastructures critiques en Afrique de l’Ouest.',
  createdAt: '2025-01-10',
  updatedAt: '2026-02-15',
};

export default function MentorDetailPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Retour à la liste
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Profil & Résumé */}
          <div className="space-y-6">
            <Card className="shadow-xs overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-secondary" />
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="w-20 h-20 rounded-full bg-white text-brand-primary font-bold flex items-center justify-center text-2xl border-4 border-white shadow-md -mt-10 mb-3">
                  {MOCK_MENTOR.firstName[0]}
                  {MOCK_MENTOR.lastName[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-foreground">
                    {MOCK_MENTOR.firstName} {MOCK_MENTOR.lastName}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{MOCK_MENTOR.title}</p>
                <p className="text-xs font-semibold text-brand-primary mt-1">{MOCK_MENTOR.company}</p>

                <div className="flex items-center gap-2 mt-4 text-xs">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{MOCK_MENTOR.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">({MOCK_MENTOR.reviewCount} avis certifiés)</span>
                </div>

                <div className="mt-6 pt-6 border-t border-border space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                    <span>{MOCK_MENTOR.city}, {MOCK_MENTOR.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    <span>{MOCK_MENTOR.experienceYears} années d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-primary" />
                    <span>{MOCK_MENTOR.languages.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold"
                  >
                    Demander un mentorat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite : Biographie, Expertises, Modalités */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-foreground mb-2">À propos</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {MOCK_MENTOR.bio}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h2 className="text-base font-bold text-foreground mb-3">Domaines de compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_MENTOR.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs py-1 px-2.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h2 className="text-base font-bold text-foreground mb-3">Secteurs & Publics accompagnés</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Secteurs :</p>
                      <p className="text-muted-foreground">{MOCK_MENTOR.sectors.join(', ')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Publics cibles :</p>
                      <p className="text-muted-foreground">{MOCK_MENTOR.targetAudiences.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h2 className="text-base font-bold text-foreground mb-3">Modalités de mentoring</h2>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="font-semibold text-foreground">Format</p>
                      <p className="text-muted-foreground mt-0.5">En visio & synchrone</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="font-semibold text-foreground">Disponibilité</p>
                      <p className="text-emerald-600 font-medium mt-0.5">Acceptation sous 48h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MentoringRequestModal
        mentor={MOCK_MENTOR}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

