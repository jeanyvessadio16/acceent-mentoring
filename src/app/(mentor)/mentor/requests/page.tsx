'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageSquare, Clock, MapPin } from 'lucide-react';

export default function MentorRequestsPage() {
  const [requests, setRequests] = React.useState([
    {
      id: 'r1',
      beneficiaryName: 'Cheikh Tidiane Fall',
      city: 'Dakar',
      objective: 'Conseil sur architecture microservices & mise en production Docker',
      problem: 'Nous développons une application de logistique et avons besoin d’orientations sur l’orchestration et les coûts cloud.',
      duration: '3 mois',
      format: 'En ligne',
      status: 'PENDING',
      createdAt: 'Aujourd’hui à 09:30',
    },
    {
      id: 'r2',
      beneficiaryName: 'Mariama Ba',
      city: 'Thiès',
      objective: 'Transition professionnelle vers le Product Management Tech',
      problem: 'Je suis actuellement business analyst et je souhaite me repositionner en tant que Product Owner certifiée.',
      duration: '1 mois (Flash)',
      format: 'En ligne',
      status: 'PENDING',
      createdAt: 'Hier à 16:45',
    },
  ]);

  const handleAction = (id: string, action: 'ACCEPTED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
  };

  return (
    <DashboardLayout role="MENTOR" userName="Awa Ndiaye" pageTitle="Demandes de mentorat">
      <PageHeader
        title="Gestion des demandes d'accompagnement"
        description="Examinez les besoins des candidats et sélectionnez les accompagnements que vous souhaitez encadrer."
      />

      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">{req.beneficiaryName}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {req.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Reçue : {req.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{req.duration}</Badge>
                  <Badge className="bg-secondary text-brand-primary text-xs">{req.format}</Badge>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-foreground">Objectif formulé :</span>
                  <p className="text-muted-foreground mt-0.5">{req.objective}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Détail du besoin :</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{req.problem}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                {req.status === 'PENDING' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Décliner avec un message
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(req.id, 'ACCEPTED')}
                      className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Accepter l'accompagnement
                    </Button>
                  </>
                ) : (
                  <Badge className={req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                    {req.status === 'ACCEPTED' ? 'Demande acceptée' : 'Demande déclinée'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

