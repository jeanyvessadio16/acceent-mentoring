'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MentorCard } from '@/components/shared/MentorCard';
import { MentorFilterBar } from '@/features/mentor-search/MentorFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { MentorProfile } from '@/types';
import { mentorsApi } from '@/lib/api/mentors';
import { Users, Loader2 } from 'lucide-react';

function mapApiMentor(m: any): MentorProfile {
  return {
    id: m.id,
    firstName: m.user?.profile?.firstName || 'Mentor',
    lastName: m.user?.profile?.lastName || '',
    email: m.user?.email || '',
    role: 'MENTOR',
    status: 'ACTIVE',
    country: m.user?.profile?.country || 'Sénégal',
    city: m.user?.profile?.city || '',
    title: m.jobTitle || 'Mentor ACCEENT',
    company: m.organization || '',
    experienceYears: m.yearsOfExperience || 0,
    sectors: m.sectors || [],
    targetAudiences: m.targetAudiences || [],
    mentoringTypes: m.mentoringTypes || ['INDIVIDUAL'],
    rating: m.averageRating ?? 5.0,
    reviewCount: 0,
    isAvailable: m.isAvailable ?? true,
    validationStatus: m.validationStatus || 'APPROVED',
    skills: m.expertises || [],
    interests: [],
    languages: m.languages || ['Français'],
    bio: m.biography || '',
    createdAt: m.createdAt || '',
    updatedAt: m.updatedAt || '',
  };
}

export default function BeneficiaryMentorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    mentorsApi
      .searchMentors({
        search: searchTerm.trim() || undefined,
        sector: selectedSector || undefined,
      })
      .then((res) => {
        if (!isCancelled) {
          const list = Array.isArray(res) ? res : res?.items || [];
          setMentors(list.map(mapApiMentor));
        }
      })
      .catch((err) => {
        console.error('Erreur chargement mentors:', err);
        if (!isCancelled) {
          setMentors([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, selectedSector]);

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

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Chargement des mentors validés...
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                baseHref="/beneficiary/mentors"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun mentor disponible"
            description="Aucun profil mentor validé ne correspond à ces critères actuellement. De nouveaux mentors sont régulièrement validés par nos équipes."
            icon={Users}
            actionLabel={searchTerm || selectedSector ? 'Réinitialiser les filtres' : undefined}
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
