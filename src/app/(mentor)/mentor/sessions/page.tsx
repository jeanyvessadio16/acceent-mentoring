'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, Video } from 'lucide-react';

export default function MentorSessionsPage() {
  return (
    <DashboardLayout role="MENTOR" userName="Awa Ndiaye" pageTitle="Mon Agenda">
      <PageHeader
        title="Agenda & Créneaux de disponibilité"
        description="Configurez vos plages horaires pour permettre à vos mentorés de réserver leurs sessions."
      >
        <Button size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Ajouter un créneau
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Sessions confirmées cette semaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Fatou Diop', time: 'Jeudi 14h00 - 15h00', topic: 'Architecture base de données & API', link: 'https://meet.google.com/xyz' },
              { name: 'Ibrahima Diallo', time: 'Vendredi 11h30 - 12h30', topic: 'Sprint review & stratégie', link: 'https://meet.google.com/abc' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                  <p className="text-xs text-brand-primary font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {s.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.topic}</p>
                </div>
                <Button size="sm" asChild className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                  <a href={s.link} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Lancer la visio
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Disponibilités récurrentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-secondary/60 border border-border">
              <p className="font-semibold text-foreground">Mardi après-midi</p>
              <p className="text-muted-foreground mt-0.5">14h00 - 18h00 (2 créneaux max)</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/60 border border-border">
              <p className="font-semibold text-foreground">Jeudi après-midi</p>
              <p className="text-muted-foreground mt-0.5">14h00 - 17h00 (2 créneaux max)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

