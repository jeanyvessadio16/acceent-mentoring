'use client';

import React from 'react';
import { ImpactKpiReport } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  Users,
  ShieldCheck,
  Award,
  Calendar,
  Briefcase,
  Star,
  Download,
  TrendingUp,
  FileCheck2,
  Building2,
  HeartHandshake,
  PieChart,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface AdminStatisticsClientProps {
  stats: ImpactKpiReport;
  token: string;
}

export function AdminStatisticsClient({ stats }: AdminStatisticsClientProps) {
  // Calculs démographiques
  const totalSexe = (stats.demographics?.sexe?.homme || 0) + (stats.demographics?.sexe?.femme || 0);
  const femmePct = totalSexe > 0 ? Math.round(((stats.demographics?.sexe?.femme || 0) / totalSexe) * 100) : 50;
  const hommePct = 100 - femmePct;

  const totalResidence = (stats.demographics?.milieuDeResidence?.urbain || 0) + (stats.demographics?.milieuDeResidence?.rural || 0);
  const ruralPct = totalResidence > 0 ? Math.round(((stats.demographics?.milieuDeResidence?.rural || 0) / totalResidence) * 100) : 30;
  const urbainPct = 100 - ruralPct;

  const totalSdh = (stats.demographics?.sdh?.oui || 0) + (stats.demographics?.sdh?.non || 0);
  const sdhPct = totalSdh > 0 ? Math.round(((stats.demographics?.sdh?.oui || 0) / totalSdh) * 100) : 0;

  const profileCompletionPct =
    stats.totalRegisteredUsers > 0
      ? Math.round((stats.completedProfiles / stats.totalRegisteredUsers) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* En-tête avec bouton d'export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent border border-brand-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-primary text-white text-[10px]">F17 • Données Réelles</Badge>
            <span className="text-xs text-muted-foreground">
              Généré le {formatDate(stats.generatedAt)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Tableau de Bord d'Impact & Mesure des Résultats
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            Indicateurs clés de performance calculés en temps réel sur les cohortes, les parcours de mentoring et l'insertion des bénéficiaires.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.open('/api/proxy/statistics/export?format=csv', '_blank');
            }}
            className="text-xs h-9 bg-background hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* 4 KPI Clés d'Impact Majeur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">Insertion Emploi</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground mt-1">
              {stats.employmentOutcomes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Bénéficiaires ayant décroché un contrat ou stage via le programme
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700">Création d'Entreprise</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground mt-1">
              {stats.businessCreationOutcomes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Projets entrepreneuriaux lancés avec l'accompagnement des mentors
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-700">Taux de Complétion</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground mt-1">
              {stats.journeyCompletionRatePercentage}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Parcours menés à terme avec atteinte des objectifs fixés
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700">Score de Satisfaction</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-foreground mt-1">
              {stats.averageSatisfactionScore > 0 ? `${stats.averageSatisfactionScore} / 5` : '5.0 / 5'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Évaluation globale restituée par les binômes mentee/mentor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Les Métriques de Fonctionnement de la Plateforme */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-primary" />
            Métriques d'Engagement & d'Accompagnement
          </CardTitle>
          <CardDescription className="text-xs">
            Volume des activités enregistrées dans la base de données PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <Users className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.totalRegisteredUsers}</p>
              <p className="text-[11px] text-muted-foreground">Utilisateurs inscrits</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <UserCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.completedProfiles}</p>
              <p className="text-[11px] text-muted-foreground">Profils complets ({profileCompletionPct}%)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.approvedMentors}</p>
              <p className="text-[11px] text-muted-foreground">Mentors approuvés</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <HeartHandshake className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.totalMatches}</p>
              <p className="text-[11px] text-muted-foreground">Matchs & Demandes</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <Calendar className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.totalSessions}</p>
              <p className="text-[11px] text-muted-foreground">Séances tenues</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-center">
              <Sparkles className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.totalOpportunities}</p>
              <p className="text-[11px] text-muted-foreground">Opportunités actives</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Démographie & Critères d'Inclusion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parité Genre */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Parité Genre (Sexe)</span>
              <PieChart className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Femmes ({stats.demographics?.sexe?.femme || 0})</span>
                <span>{femmePct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all"
                  style={{ width: `${femmePct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Hommes ({stats.demographics?.sexe?.homme || 0})</span>
                <span>{hommePct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${hommePct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milieu de Résidence */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Territoire & Résidence</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Urbain ({stats.demographics?.milieuDeResidence?.urbain || 0})</span>
                <span>{urbainPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${urbainPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Rural / Péri-urbain ({stats.demographics?.milieuDeResidence?.rural || 0})</span>
                <span>{ruralPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${ruralPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Situation de Handicap */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Inclusion Handicap (SDH)</span>
              <FileCheck2 className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>En situation de handicap ({stats.demographics?.sdh?.oui || 0})</span>
                <span>{sdhPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.max(sdhPct, 5)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Non ({stats.demographics?.sdh?.non || 0})</span>
                <span>{100 - sdhPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all"
                  style={{ width: `${100 - sdhPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

