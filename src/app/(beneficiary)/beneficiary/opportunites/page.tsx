'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { OpportunityItem } from '@/types';
import { Briefcase, Search } from 'lucide-react';

const MOCK_OPPORTUNITIES: OpportunityItem[] = [
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
  {
    id: 'op3',
    title: 'Bourse d’Excellence Master Cybersécurité & IA',
    organization: 'Fondation Afrique Avenir',
    location: 'Sénégal / International',
    category: 'BOURSE',
    deadline: '2026-12-01',
    description: 'Prise en charge intégrale des frais de scolarité et allocation mensuelle pour étudiants méritants.',
    isExpired: false,
  },
  {
    id: 'op4',
    title: 'Chef de Projet Junior — Transformation Digitale',
    organization: 'Groupe Bancaire Ouest-Africain',
    location: 'Abidjan, Côte d’Ivoire',
    category: 'EMPLOI',
    deadline: '2026-11-20',
    description: 'CDI junior pour accompagner le déploiement de nouvelles solutions bancaires mobiles.',
    isExpired: false,
  },
  {
    id: 'op5',
    title: 'Formation Intensive Data Science & Intelligence Artificielle',
    organization: 'KeurTech Academy',
    location: 'Dakar, Sénégal',
    category: 'FORMATION',
    deadline: '2026-12-10',
    description: 'Bootcamp certifiant de 12 semaines avec mentorat personnalisé et projet de mise en situation réelle.',
    isExpired: false,
  },
];

export default function BeneficiaryOpportunitiesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const categories = ['Toutes', 'EMPLOI', 'STAGE', 'FORMATION', 'BOURSE', 'FINANCEMENT'];

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === 'Toutes' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout role="BENEFICIARY" pageTitle="Opportunités">
      <PageHeader
        title="Opportunités & Offres d'emploi"
        description="Découvrez des offres de stages, emplois, bourses et financements recommandés pour votre profil."
      />

      <div className="space-y-6">
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par mot-clé, entreprise..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isSelected = (!selectedCategory && cat === 'Toutes') || selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'Toutes' ? '' : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-brand-primary text-white'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Liste des offres */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune opportunité trouvée"
            description="Modifiez vos filtres ou tentez une autre recherche pour trouver des offres pertinentes."
            icon={Briefcase}
            actionLabel="Réinitialiser les filtres"
            onActionClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

