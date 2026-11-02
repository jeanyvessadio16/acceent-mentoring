'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

export default function MentorsValidationPage() {
  const [candidates, setCandidates] = React.useState([
    {
      id: 'c1',
      name: 'Dr. Ousmane Kane',
      title: 'VP Data & IA chez Fintech Alliance',
      company: 'Fintech Alliance Africa',
      experienceYears: 16,
      sectors: ['Tech & Digital', 'Intelligence Artificielle', 'Fintech'],
      bio: 'Docteur en informatique appliquée, plus de 15 ans d’expérience en conduite de projets analytiques et déploiement de modèles de machine learning bancaires.',
      status: 'PENDING',
    },
    {
      id: 'c2',
      name: 'Sokhna Mbaye',
      title: 'Directrice RSE & Transition Écologique',
      company: 'Green Sahel Solutions',
      experienceYears: 11,
      sectors: ['Agrobusiness', 'Développement Durable'],
      bio: 'Accompagne les coopératives et startups de l’agrobusiness vers des modèles régénératifs et l’accès aux crédits carbone.',
      status: 'PENDING',
    },
  ]);

  const handleValidate = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <DashboardLayout role="ADMIN" userName="Administrateur ACCEENT" pageTitle="Validation Mentors">
      <PageHeader
        title="Dossiers de candidatures mentors"
        description="Vérifiez les profils et références des candidats avant approbation publique sur la plateforme."
      />

      <div className="space-y-4">
        {candidates.map((cand) => (
          <Card key={cand.id} className="shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">{cand.name}</h3>
                  <p className="text-xs text-muted-foreground">{cand.title} • {cand.company}</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  {cand.experienceYears} années d'expérience
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground leading-relaxed">{cand.bio}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cand.sectors.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <Button variant="ghost" size="sm" className="text-xs text-brand-primary flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Consulter le CV et pièces justificatives
                  <ExternalLink className="w-3 h-3" />
                </Button>

                <div className="flex items-center gap-2">
                  {cand.status === 'PENDING' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidate(cand.id, 'REJECTED')}
                        className="text-xs text-rose-600 hover:text-rose-700 h-8"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleValidate(cand.id, 'APPROVED')}
                        className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-8"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Valider & Publier
                      </Button>
                    </>
                  ) : (
                    <Badge className={cand.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                      {cand.status === 'APPROVED' ? 'Profil Approuvé' : 'Candidature Refusée'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

