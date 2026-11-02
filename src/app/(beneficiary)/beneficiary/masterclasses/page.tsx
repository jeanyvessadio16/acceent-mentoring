'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
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

export default function BeneficiaryMasterclassesPage() {
  const [selectedFilter, setSelectedFilter] = React.useState('Toutes');
  const filters = ['Toutes', 'Tech & Digital', 'Entrepreneuriat', 'Carrière'];

  const filteredMasterclasses = MOCK_MASTERCLASSES.filter((mc) => {
    if (selectedFilter === 'Toutes') return true;
    return mc.category === selectedFilter;
  });

  return (
    <DashboardLayout role="BENEFICIARY" pageTitle="Masterclasses">
      <PageHeader
        title="Masterclasses & Ateliers Pratiques"
        description="Développez vos compétences auprès d'experts du continent à travers des ateliers thématiques en direct ou en replay."
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? 'bg-brand-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMasterclasses.map((masterclass) => (
            <MasterclassCard key={masterclass.id} masterclass={masterclass} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

