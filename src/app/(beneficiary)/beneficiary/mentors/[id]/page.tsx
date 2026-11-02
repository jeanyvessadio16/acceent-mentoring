'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MentoringRequestModal } from '@/features/mentoring-requests/MentoringRequestModal';
import { MentorProfile } from '@/types';
import { mentorsApi } from '@/lib/api/mentors';
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  Users,
  Loader2,
} from 'lucide-react';

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
  const mentorId = params?.id as string;

  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!mentorId) return;

    let isCancelled = false;
    setIsLoading(true);

    mentorsApi
      .getMentorById(mentorId)
      .then((res) => {
        if (!isCancelled && res) {
          setMentor(mapApiMentor(res));
        }
      })
      .catch((err) => {
        console.error('Erreur récupération mentor:', err);
        if (!isCancelled) setMentor(null);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [mentorId]);

  if (isLoading) {
    return <MentorDetailSkeleton />;
  }

  if (!mentor) {
    return (
      <DashboardLayout role="BENEFICIARY" pageTitle="Profil Mentor">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/beneficiary/mentors')}
            className="text-xs hover:text-brand-primary p-0 h-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Retour à l'annuaire des mentors
          </Button>
        </div>
        <EmptyState
          title="Mentor introuvable"
          description="Le profil recherché n'existe pas ou n'est plus disponible sur la plateforme."
          icon={Users}
          actionLabel="Voir tous les mentors"
          actionHref="/beneficiary/mentors"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="BENEFICIARY" pageTitle={`Mentor ${mentor.firstName} ${mentor.lastName}`}>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/beneficiary/mentors')}
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
                  <span>{[mentor.city, mentor.country].filter(Boolean).join(', ')}</span>
                </div>
                {mentor.experienceYears > 0 && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{mentor.experienceYears} ans d'expérience</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{mentor.rating.toFixed(1)}</span>
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
                  {mentor.bio || "Ce mentor n'a pas encore rédigé de biographie détaillée."}
                </p>
              </CardContent>
            </Card>

            {mentor.skills.length > 0 && (
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
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-sm text-foreground">Informations de mentorat</h3>

                <div className="space-y-2 text-xs">
                  {mentor.sectors.length > 0 && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Secteurs d'intervention</span>
                      <span className="font-medium">{mentor.sectors.join(', ')}</span>
                    </div>
                  )}
                  {mentor.targetAudiences.length > 0 && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Publics cibles</span>
                      <span className="font-medium">{mentor.targetAudiences.join(', ')}</span>
                    </div>
                  )}
                  {mentor.languages.length > 0 && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Langues parlées</span>
                      <span className="font-medium">{mentor.languages.join(', ')}</span>
                    </div>
                  )}
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
