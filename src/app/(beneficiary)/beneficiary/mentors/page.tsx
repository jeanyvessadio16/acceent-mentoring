'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MentorCard } from '@/components/shared/MentorCard';
import { MentorFilterBar } from '@/features/mentor-search/MentorFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { MentorProfile } from '@/types';
import { Users } from 'lucide-react';

const MOCK_MENTORS: MentorProfile[] = [
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
    country: 'Sénégal',
    city: 'Dakar',
    title: 'Consultante RH & Coach Professionnelle Certifiée',
    company: 'Talents & Ambitions Africa',
    experienceYears: 10,
    sectors: ['Ressources Humaines', 'Leadership'],
    targetAudiences: ['Femmes leaders', 'Professionnels en reconversion'],
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
  {
    id: 'm4',
    firstName: 'Cheikh',
    lastName: 'Gueye',
    email: 'cheikh.gueye@exemple.sn',
    role: 'MENTOR',
    status: 'ACTIVE',
    country: 'Sénégal',
    city: 'Dakar',
    title: 'Directeur Financier & Spécialiste M&A',
    company: 'West Africa Capital Partners',
    experienceYears: 14,
    sectors: ['Finance & Fintech', 'Entrepreneuriat'],
    targetAudiences: ['PME', 'Startups en Série A'],
    mentoringTypes: ['INDIVIDUAL'],
    rating: 4.9,
    reviewCount: 22,
    isAvailable: true,
    validationStatus: 'APPROVED',
    skills: ['Modélisation Financière', 'Audit', 'Stratégie de Financement'],
    interests: ['Microfinance', 'Impact investing'],
    languages: ['Français', 'Anglais'],
    bio: 'Conseiller financier et mentor de dirigeants pour optimiser la structure de capital et réussir les phases de croissance.',
    createdAt: '2025-02-10',
    updatedAt: '2026-03-05',
  },
];

export default function BeneficiaryMentorsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSector, setSelectedSector] = React.useState('');

  const filteredMentors = MOCK_MENTORS.filter((mentor) => {
    const matchesSearch =
      mentor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSector =
      !selectedSector || mentor.sectors.includes(selectedSector);

    return matchesSearch && matchesSector;
  });

  return (
    <DashboardLayout role="BENEFICIARY" pageTitle="Trouver un Mentor">
      <PageHeader
        title="Annuaire des Mentors & Experts"
        description="Trouvez le mentor idéal pour vous guider selon votre domaine, vos ambitions et vos objectifs de carrière."
      />

      <div className="space-y-6">
        <MentorFilterBar
          onSearchChange={setSearchTerm}
          onSectorChange={setSelectedSector}
          selectedSector={selectedSector}
        />

        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                baseHref="/beneficiary/mentors"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun mentor trouvé"
            description="Essayez de modifier vos filtres de recherche ou sélectionnez un autre secteur d'activité."
            icon={Users}
            actionLabel="Réinitialiser les filtres"
            onActionClick={() => {
              setSearchTerm('');
              setSelectedSector('');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

