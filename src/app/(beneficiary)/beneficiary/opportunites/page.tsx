'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { OpportunityItem } from '@/types';
import { opportunitiesApi } from '@/lib/api/opportunities';
import { Briefcase, Search, Loader2 } from 'lucide-react';

function mapApiOpportunity(op: any): OpportunityItem {
  return {
    id: op.id,
    title: op.title,
    organization: op.organization || 'Organisme partenaire',
    location: op.city ? `${op.city}, ${op.country || 'Sénégal'}` : op.country || 'Sénégal',
    category: op.category || 'EMPLOI',
    deadline: op.expiresAt || '',
    description: op.description || '',
    applicationUrl: op.externalUrl || undefined,
    isExpired: op.expiresAt ? new Date(op.expiresAt) < new Date() : false,
  };
}

export default function BeneficiaryOpportunitesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Toutes', 'EMPLOI', 'STAGE', 'FORMATION', 'BOURSE', 'FINANCEMENT', 'CONCOURS'];

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    opportunitiesApi
      .getAll({
        search: searchTerm.trim() || undefined,
        category: selectedCategory || undefined,
      })
      .then((res) => {
        if (!isCancelled) {
          const list = Array.isArray(res) ? res : res?.items || [];
          setOpportunities(list.map(mapApiOpportunity));
        }
      })
      .catch((err) => {
        console.error('Erreur chargement opportunités:', err);
        if (!isCancelled) setOpportunities([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, selectedCategory]);

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Chargement des opportunités...
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune offre publiée pour le moment"
            description="De nouvelles opportunités de stages, concours et formations validées par l'administration seront bientôt publiées."
            icon={Briefcase}
            actionLabel={searchTerm || selectedCategory ? 'Réinitialiser les filtres' : undefined}
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
