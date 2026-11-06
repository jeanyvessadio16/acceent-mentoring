'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MentorProfile } from '@/types';
import { MatchingResultItem } from '@/lib/api/matching';
import { DiagnosticItem } from '@/lib/api/diagnostics';
import { MentorCard } from '@/components/shared/MentorCard';
import { MentorFilterBar } from './MentorFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface RecommendedMentorItem {
  mentor: MentorProfile;
  totalScore: number;
  justification: string;
}

interface BeneficiaryMentorsDirectoryProps {
  allMentors: MentorProfile[];
  recommendations: MatchingResultItem[];
  currentDiagnostic: DiagnosticItem | null;
}

export function BeneficiaryMentorsDirectory({
  allMentors,
  recommendations,
  currentDiagnostic,
}: BeneficiaryMentorsDirectoryProps) {
  // Onglet actif : 'recommended' par défaut si un diagnostic existe, sinon 'all'
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>(
    currentDiagnostic ? 'recommended' : 'all'
  );

  // Filtres pour l'annuaire complet
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  // Filtre score pour les recommandations
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Mapper les recommandations en profils mentors complets
  const mappedRecommendations: RecommendedMentorItem[] = recommendations.map((item) => {
    const m = item.mentorProfile;
    const userProfile = m?.user?.profile;

    const mentor: MentorProfile = {
      id: m?.id || item.mentorProfileId,
      firstName: userProfile?.firstName || 'Mentor',
      lastName: userProfile?.lastName || '',
      email: m?.user?.email || '',
      role: 'MENTOR',
      status: 'ACTIVE',
      country: userProfile?.country || 'Sénégal',
      city: userProfile?.city || '',
      title: m?.jobTitle || 'Mentor ACCEENT',
      company: m?.organization || '',
      experienceYears: m?.yearsOfExperience || 0,
      sectors: m?.sectors || [],
      targetAudiences: [],
      mentoringTypes: (m?.mentoringTypes as any) || ['INDIVIDUAL'],
      rating: m?.averageRating ?? 5.0,
      reviewCount: m?.totalReviews ?? 0,
      isAvailable: true,
      validationStatus: 'APPROVED',
      skills: m?.expertises || [],
      interests: [],
      languages: m?.languages || ['Français'],
      bio: m?.biography || '',
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    };

    return {
      mentor,
      totalScore: item.totalScore,
      justification: item.justification,
    };
  });

  // Filtrage des recommandations
  const filteredRecommendations = mappedRecommendations.filter((item) => {
    if (minScoreFilter > 0 && item.totalScore < minScoreFilter) return false;
    if (selectedSector && !item.mentor.sectors.includes(selectedSector)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = `${item.mentor.firstName} ${item.mentor.lastName}`.toLowerCase();
      const title = item.mentor.title.toLowerCase();
      const hasSkill = item.mentor.skills.some((s) => s.toLowerCase().includes(term));
      if (!name.includes(term) && !title.includes(term) && !hasSkill) return false;
    }
    return true;
  });

  // Filtrage de l'annuaire complet
  const filteredAllMentors = allMentors.filter((mentor) => {
    if (selectedSector && !mentor.sectors.includes(selectedSector)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = `${mentor.firstName} ${mentor.lastName}`.toLowerCase();
      const title = mentor.title.toLowerCase();
      const hasSkill = mentor.skills.some((s) => s.toLowerCase().includes(term));
      if (!name.includes(term) && !title.includes(term) && !hasSkill) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Navigation par onglets stylisés */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommandés pour moi</span>
            {currentDiagnostic && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'recommended'
                    ? 'bg-white/20 text-white'
                    : 'bg-brand-primary/10 text-brand-primary'
                }`}
              >
                {mappedRecommendations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tous les mentors</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {allMentors.length}
            </span>
          </button>
        </div>

        {/* Info rapide sur le diagnostic actif si disponible */}
        {currentDiagnostic && activeTab === 'recommended' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate max-w-xs">
              Cible : <strong className="text-foreground">{currentDiagnostic.sector}</strong>
            </span>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 text-brand-primary">
              <Link href="/beneficiary/diagnostic">Modifier</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Barre de recherche et de filtres */}
      <div className="space-y-4">
        <MentorFilterBar
          onSearchChange={setSearchTerm}
          onSectorChange={setSelectedSector}
          selectedSector={selectedSector}
        />

        {/* Filtre de score pour les recommandations */}
        {activeTab === 'recommended' && currentDiagnostic && mappedRecommendations.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <SlidersHorizontal className="w-3 h-3" />
              Filtrer par affinité :
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Tous les scores', val: 0 },
                { label: '≥ 80% (Forte affinité)', val: 80 },
                { label: '≥ 60%', val: 60 },
              ].map((filter) => (
                <button
                  key={filter.val}
                  type="button"
                  onClick={() => setMinScoreFilter(filter.val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors cursor-pointer ${
                    minScoreFilter === filter.val
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONTENU ONGLET 1 : RECOMMANDATIONS */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          {!currentDiagnostic ? (
            /* Bannière invitant à faire le diagnostic */
            <Card className="border-brand-primary/30 bg-linear-to-r from-brand-primary/5 via-brand-accent/5 to-transparent shadow-xs">
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-lg mx-auto">
                  <h3 className="text-base font-bold text-foreground">
                    Activez votre algorithme de matching personnalisé
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vous n'avez pas encore réalisé votre diagnostic d'orientation. Répondez au questionnaire (2 minutes) pour découvrir les mentors qui correspondent exactement à vos objectifs et compétences.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                    <Link href="/beneficiary/diagnostic" className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Réaliser mon diagnostic
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('all')}
                    className="text-xs"
                  >
                    Consulter tous les mentors
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((item) => (
                <MentorCard
                  key={item.mentor.id}
                  mentor={item.mentor}
                  baseHref="/beneficiary/mentors"
                  matchScore={item.totalScore}
                  matchJustification={item.justification}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun mentor recommandé avec ces critères"
              description="Essayez de baisser le seuil d'affinité ou de réinitialiser vos filtres de recherche."
              icon={Sparkles}
              actionLabel="Réinitialiser les filtres"
              onActionClick={() => {
                setSearchTerm('');
                setSelectedSector('');
                setMinScoreFilter(0);
              }}
            />
          )}
        </div>
      )}

      {/* CONTENU ONGLET 2 : TOUS LES MENTORS */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {filteredAllMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllMentors.map((mentor) => (
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
              description="Aucun profil mentor validé ne correspond à ces filtres actuellement."
              icon={Users}
              actionLabel={searchTerm || selectedSector ? 'Réinitialiser les filtres' : undefined}
              onActionClick={() => {
                setSearchTerm('');
                setSelectedSector('');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

