'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MentoringRequestModal } from '@/features/mentoring-requests/MentoringRequestModal';
import { MentorProfile } from '@/types';
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
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
    'Cybersécurité',
  ],
  interests: ['Inclusion numérique des femmes', 'Open Source en Afrique'],
  languages: ['Français', 'Wolof', 'Anglais'],
  bio: 'Passionnée par l’émergence technologique africaine et l’excellence en ingénierie logicielle. J’accompagne depuis plus de 6 ans des jeunes diplômés et des porteurs de projets dans la structuration de leurs compétences d’architecture et leur positionnement sur le marché international.',
  createdAt: '2025-01-10',
  updatedAt: '2026-02-15',
};

function MentorDetailSkeleton() {
  return (
    <DashboardLayout role="BENEFICIARY" pageTitle="Profil Mentor">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </DashboardLayout>
  );
}

function BeneficiaryMentorDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const mentor = MOCK_MENTOR;

  return (
    <DashboardLayout role="BENEFICIARY" pageTitle="Profil Mentor">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-xs hover:text-brand-primary p-0 h-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Retour à l'annuaire des mentors
        </Button>
      </div>

      <div className="space-y-6">
        {/* En-tête profil */}
        <Card className="shadow-xs overflow-hidden border-border">
          <div className="h-28 bg-linear-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20" />
          <CardContent className="relative px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-background bg-brand-primary text-white font-bold flex items-center justify-center text-2xl shadow-md shrink-0">
                {mentor.firstName[0]}
                {mentor.lastName[0]}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-secondary text-white text-xs shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Demander un accompagnement
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {mentor.firstName} {mentor.lastName}
                </h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Mentor Validé ACCEENT
                </Badge>
              </div>

              <p className="text-sm font-medium text-foreground">{mentor.title}</p>
              {mentor.company && (
                <p className="text-xs text-brand-secondary font-medium">{mentor.company}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{mentor.city}, {mentor.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{mentor.experienceYears} ans d'expérience</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{mentor.rating.toFixed(1)}</span>
                  <span className="font-normal text-muted-foreground">({mentor.reviewCount} avis)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails du mentor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-base text-foreground">À propos du mentor</h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-base text-foreground">Compétences & Domaines d'expertise</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {mentor.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Informations de mentorat</h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Secteurs d'intervention</span>
                    <span className="font-medium">{mentor.sectors.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Publics cibles</span>
                    <span className="font-medium">{mentor.targetAudiences.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Langues parlées</span>
                    <span className="font-medium">{mentor.languages.join(', ')}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs mt-2"
                >
                  Envoyer une demande
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MentoringRequestModal
        mentor={mentor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}

export default function BeneficiaryMentorDetailPage() {
  return (
    <Suspense fallback={<MentorDetailSkeleton />}>
      <BeneficiaryMentorDetailContent />
    </Suspense>
  );
}
