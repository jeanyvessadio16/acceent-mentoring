'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { OpportunityItem } from '@/types';
import { Briefcase, Search, Filter } from 'lucide-react';

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
];

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const categories = ['Toutes', 'EMPLOI', 'STAGE', 'FORMATION', 'BOURSE', 'FINANCEMENT'];

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === 'Toutes' || opp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Opportunity Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Découvrez des opportunités qualifiées d'emploi, de stage, de bourse et de financement pour dynamiser votre carrière.
          </p>
        </div>

        {/* Barre de recherche et catégories */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-4 mb-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Rechercher une offre par mot-clé, organisation..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type :
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat || (cat === 'Toutes' && !selectedCategory);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'Toutes' ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-brand-primary text-white border-brand-primary font-medium'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune opportunité trouvée"
            description="Essayez de modifier vos critères de recherche ou sélectionnez une autre catégorie."
            icon={Briefcase}
            actionLabel="Réinitialiser"
            onActionClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

