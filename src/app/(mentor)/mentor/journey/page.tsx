'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, UserCheck, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function MentorJourneyPage() {
  const mentees = [
    {
      id: 'm1',
      name: 'Fatou Diop',
      goal: 'Devenir Ingénieure Frontend Senior',
      progress: 65,
      sessionsCount: 4,
      lastSession: 'Il y a 10 jours',
    },
    {
      id: 'm2',
      name: 'Ibrahima Diallo',
      goal: 'Lancer sa startup SaaS B2B',
      progress: 40,
      sessionsCount: 2,
      lastSession: 'Il y a 2 semaines',
    },
  ];

  return (
    <DashboardLayout role="MENTOR" userName="Awa Ndiaye" pageTitle="Suivi des mentorés">
      <PageHeader
        title="Mentorés accompagnés"
        description="Consultez l'avancement des feuilles de route et les tâches assignées à vos mentorés."
      />

      <div className="space-y-4">
        {mentees.map((mentee) => (
          <Card key={mentee.id} className="shadow-xs">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{mentee.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">Actif</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{mentee.goal}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>{mentee.sessionsCount} sessions réalisées</span>
                  <span>Dernier échange : {mentee.lastSession}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-bold text-brand-primary">{mentee.progress}%</span>
                  <p className="text-[10px] text-muted-foreground">Progression</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs hover:text-brand-primary">
                  Voir la feuille de route
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

