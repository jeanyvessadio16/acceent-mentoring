'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, Award, Briefcase, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="ADMIN" userName="Administrateur ACCEENT" pageTitle="Supervision & Pilotage">
      <PageHeader
        title="Console d'Administration"
        description="Vue globale sur l'écosystème, l'impact des accompagnements et la modération des profils."
      >
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Link href="/admin/mentors-validation">Candidatures en attente (3)</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Utilisateurs"
          value="1 480"
          trend="+12%"
          description="ce mois"
          icon={Users}
        />
        <StatsCard
          title="Mentors Validés"
          value="254"
          description="3 en attente de revue"
          icon={ShieldCheck}
        />
        <StatsCard
          title="Accompagnements en cours"
          value="312"
          trend="88% de rétention"
          icon={Award}
        />
        <StatsCard
          title="Opportunités Actives"
          value="45"
          description="18 entreprises partenaires"
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières candidatures mentors */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Candidatures Mentors à Valider</CardTitle>
            <Link href="/admin/mentors-validation" className="text-xs text-brand-primary font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Dr. Ousmane Kane', title: 'VP Data & IA chez Fintech Alliance', experience: '16 ans', date: 'Hier' },
              { name: 'Sokhna Mbaye', title: 'Directrice RSE & Transition Écologique', experience: '11 ans', date: 'Il y a 2 jours' },
              { name: 'David Kouamé', title: 'Chief Technology Officer @ PayWest', experience: '13 ans', date: 'Il y a 3 jours' },
            ].map((cand, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-xs text-foreground">{cand.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cand.title}</p>
                  <span className="text-[10px] text-brand-primary font-medium">{cand.experience} d’expérience</span>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-7">
                  <Link href="/admin/mentors-validation">Examiner</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Indicateurs d'impact */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Indicateurs d'Impact & Répartition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Objectifs d'insertion professionnelle atteints</span>
                <span className="text-brand-primary font-bold">78%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-[78%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Startups & Projets accompagnés ayant levé des fonds</span>
                <span className="text-brand-primary font-bold">34%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-brand-secondary h-full w-[34%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>Parité et inclusion (Femmes accompagnées)</span>
                <span className="text-brand-primary font-bold">52%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[52%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

