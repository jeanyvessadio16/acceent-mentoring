'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MasterclassCard } from '@/components/shared/MasterclassCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { MasterclassItem } from '@/types';
import { masterclassesApi } from '@/lib/api/masterclasses';
import { GraduationCap, Loader2 } from 'lucide-react';

function mapApiMasterclass(mc: any): MasterclassItem {
  return {
    id: mc.id,
    title: mc.title,
    speakerName: mc.speakerName || 'Intervenant expert',
    speakerRole: mc.speakerBio || 'Expert ACCEENT',
    scheduledAt: mc.scheduledAt || '',
    durationMinutes: mc.durationMins || 60,
    category: mc.category || 'Atelier',
    description: mc.description || '',
    participantCount: mc.registrationCount || 0,
    isRegistered: false,
    liveUrl: mc.meetingUrl || undefined,
  };
}

export default function BeneficiaryMasterclassesPage() {
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [masterclasses, setMasterclasses] = useState<MasterclassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ['Toutes', 'Tech & Digital', 'Entrepreneuriat', 'Carrière', 'Soft Skills'];

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    masterclassesApi
      .getAll({
        category: selectedFilter === 'Toutes' ? undefined : selectedFilter,
      })
      .then((res) => {
        if (!isCancelled) {
          const list = Array.isArray(res) ? res : res?.items || [];
          setMasterclasses(list.map(mapApiMasterclass));
        }
      })
      .catch((err) => {
        console.error('Erreur chargement masterclasses:', err);
        if (!isCancelled) setMasterclasses([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedFilter]);

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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? 'bg-brand-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Chargement des masterclasses...
          </div>
        ) : masterclasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterclasses.map((mc) => (
              <MasterclassCard key={mc.id} masterclass={mc} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun atelier programmé pour le moment"
            description="Le calendrier des prochaines masterclasses et ateliers en direct sera bientôt publié."
            icon={GraduationCap}
            actionLabel={selectedFilter !== 'Toutes' ? 'Voir toutes les catégories' : undefined}
            onActionClick={() => setSelectedFilter('Toutes')}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
