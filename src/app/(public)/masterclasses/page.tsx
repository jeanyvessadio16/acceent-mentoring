'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MasterclassCard } from '@/components/shared/MasterclassCard';
import { MasterclassItem } from '@/types';
import { GraduationCap } from 'lucide-react';

const MOCK_MASTERCLASSES: MasterclassItem[] = [
  {
    id: 'mc1',
    title: 'Réussir sa levée de fonds d’amorçage en Afrique de l’Ouest',
    speakerName: 'Babacar Ndiaye',
    speakerRole: 'Managing Partner @ Sahel Capital',
    scheduledAt: '2026-11-15T18:00:00Z',
    durationMinutes: 90,
    category: 'Entrepreneuriat',
    description: 'Une session pratique pour comprendre les attentes réelles des business angels et fonds d’amorçage dans la sous-région.',
    participantCount: 142,
    isRegistered: false,
  },
  {
    id: 'mc2',
    title: 'Architecture Web moderne avec Next.js et Supabase',
    speakerName: 'Awa Ndiaye',
    speakerRole: 'Lead Architect @ Fintech Forum',
    scheduledAt: '2026-11-22T17:30:00Z',
    durationMinutes: 75,
    category: 'Tech & Digital',
    description: 'Bonnes pratiques de scalabilité, authentification SSR et gestion de sécurité applicative pour produits digitaux.',
    participantCount: 210,
    isRegistered: false,
  },
  {
    id: 'mc3',
    title: 'Construire son Personal Branding et son Réseau Professionnel',
    speakerName: 'Aminata Diallo',
    speakerRole: 'Head of People & Talents',
    scheduledAt: '2026-10-10T16:00:00Z',
    durationMinutes: 60,
    category: 'Carrière',
    description: 'Stratégies concrètes pour maximiser sa visibilité sur LinkedIn et attirer les recruteurs et partenaires.',
    participantCount: 350,
    isRegistered: true,
  },
];

export default function MasterclassesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Masterclasses & Webinaires</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Apprenez des meilleurs experts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Des sessions interactives en direct et des replays exclusifs pour accélérer votre apprentissage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_MASTERCLASSES.map((mc) => (
            <MasterclassCard key={mc.id} masterclass={mc} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

