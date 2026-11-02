'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Check,
  X
} from 'lucide-react';

export default function MentorDashboardPage() {
  return (
    <DashboardLayout role="MENTOR" userName="Awa Ndiaye" pageTitle="Tableau de bord Mentor">
      <PageHeader
        title="Bonjour, Awa 👋"
        description="Gérez vos mentorés, vos créneaux de session et répondez aux demandes d'accompagnement."
      >
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Link href="/mentor/sessions">Ouvrir de nouveaux créneaux</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Mentorés Actifs"
          value="4"
          trend="Capacité : 5 max"
          icon={Users}
        />
        <StatsCard
          title="Demandes en attente"
          value="2"
          description="À traiter sous 48h"
          icon={Clock}
        />
        <StatsCard
          title="Sessions effectuées"
          value="18"
          description="Total 2026"
          icon={Calendar}
        />
        <StatsCard
          title="Note Moyenne"
          value="4.9 / 5"
          description="28 évaluations"
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Demandes récentes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Demandes d'accompagnement reçues</CardTitle>
                <Link href="/mentor/requests" className="text-xs text-brand-primary font-semibold hover:underline">
                  Voir toutes les demandes
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  id: 'r1',
                  name: 'Cheikh Tidiane Fall',
                  objective: 'Conseil sur architecture microservices & mise en production Docker',
                  duration: '3 mois',
                  date: 'Aujourd’hui',
                },
                {
                  id: 'r2',
                  name: 'Mariama Ba',
                  objective: 'Transition professionnelle vers le Product Management Tech',
                  duration: '1 mois (Flash)',
                  date: 'Hier',
                },
              ].map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{req.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{req.objective}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {req.duration}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground">{req.date}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs text-rose-600 hover:text-rose-700 h-8">
                        <X className="w-3.5 h-3.5 mr-1" />
                        Décliner
                      </Button>
                      <Button size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-8">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Accepter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) : Prochains rendez-vous */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                Prochains RDV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border border-border space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Fatou Diop</span>
                  <span className="text-brand-primary font-medium">Jeudi 14h00</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Session de code review</p>
              </div>

              <div className="p-3 rounded-lg border border-border space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Ibrahima Diallo</span>
                  <span className="text-brand-primary font-medium">Vendredi 11h30</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Point d'étape MVP</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

