'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, ShieldCheck } from 'lucide-react';

export default function MentorProfilePage() {
  const [title, setTitle] = React.useState('Lead Software Architect & Tech Advisor');
  const [company, setCompany] = React.useState('Sonatel & Africa Fintech Forum');
  const [experienceYears, setExperienceYears] = React.useState(12);
  const [bio, setBio] = React.useState(
    'Passionnée par l’émergence technologique africaine, j’aide les jeunes développeurs et porteurs de projets à bâtir des systèmes résilients et scalables.'
  );

  return (
    <DashboardLayout role="MENTOR" userName="Awa Ndiaye" pageTitle="Mon Profil Mentor">
      <PageHeader
        title="Profil Professionnel & Paramètres Mentor"
        description="Ces informations sont affichées sur l'annuaire public pour aider les bénéficiaires à vous identifier."
      />

      <div className="max-w-3xl space-y-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Fiche Expert / Mentor</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Compte Vérifié
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">Titre / Rôle actuel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs">Entreprise / Organisation</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experienceYears" className="text-xs">Années d'expérience professionnelle</Label>
              <Input
                id="experienceYears"
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs">Biographie publique</Label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Label className="text-xs mb-2 block">Secteurs d'intervention</Label>
              <div className="flex flex-wrap gap-2">
                {['Tech & Digital', 'Fintech', 'Cloud Computing', 'Entrepreneuriat'].map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Mettre à jour mon profil
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}

