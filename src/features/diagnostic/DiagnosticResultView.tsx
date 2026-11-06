'use client';

import React from 'react';
import Link from 'next/link';
import { DiagnosticItem } from '@/lib/api/diagnostics';
import { MatchingResultItem } from '@/lib/api/matching';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Sparkles,
  Target,
  Briefcase,
  Compass,
  ArrowRight,
  RefreshCw,
  Star,
  Users,
  MapPin,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface DiagnosticResultViewProps {
  diagnostic: DiagnosticItem;
  recommendations: MatchingResultItem[];
  onRetake?: () => void;
}

export function DiagnosticResultView({
  diagnostic,
  recommendations,
  onRetake,
}: DiagnosticResultViewProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* En-tête succès */}
      <Card className="border-emerald-300 bg-linear-to-r from-emerald-50/70 via-teal-50/40 to-transparent shadow-xs">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Diagnostic d'orientation validé
                </h2>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  Actif
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Réalisé le {formatDate(diagnostic.createdAt)}. Vos besoins sont analysés et synchronisés avec l'algorithme de recommandation.
              </p>
            </div>
          </div>

          {onRetake && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetake}
              className="text-xs shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mettre à jour mon diagnostic
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Profil de besoin identifié */}
      <Card className="shadow-xs border-brand-primary/20">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-primary" />
            Synthèse de votre profil de besoin
          </CardTitle>
          <CardDescription className="text-xs">
            Ces critères constituent votre feuille de route pour le matching de mentorat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          {/* Objectif principal */}
          <div className="p-3.5 rounded-lg bg-brand-primary/5 border border-brand-primary/15 space-y-1">
            <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wide">
              Objectif prioritaire
            </span>
            <p className="text-sm font-bold text-foreground">
              {diagnostic.mainObjective}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Secteur cible</span>
              <p className="font-semibold text-foreground text-xs">{diagnostic.sector}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Domaine d'expertise</span>
              <p className="font-semibold text-foreground text-xs">{diagnostic.domain}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Niveau d'avancement</span>
              <p className="font-semibold text-foreground text-xs">{diagnostic.level}</p>
            </div>
          </div>

          {/* Besoins prioritaires */}
          {diagnostic.needs && diagnostic.needs.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Besoins prioritaires d'accompagnement :</span>
              <div className="flex flex-wrap gap-1.5">
                {diagnostic.needs.map((need, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs py-0.5 px-2 bg-brand-primary/10 text-brand-primary border-none">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Compétences ciblées */}
          {diagnostic.skills && diagnostic.skills.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Compétences concernées :</span>
              <div className="flex flex-wrap gap-1.5">
                {diagnostic.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs py-0.5 px-2">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Détails logistiques */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/60 text-muted-foreground text-[11px]">
            <span>
              Format : <strong className="text-foreground">{diagnostic.preferredFormat === 'REMOTE' ? 'À distance' : diagnostic.preferredFormat === 'IN_PERSON' ? 'Présentiel' : 'Hybride'}</strong>
            </span>
            <span>
              Disponibilité : <strong className="text-foreground">{diagnostic.availability}</strong>
            </span>
            {diagnostic.preferredLanguages && diagnostic.preferredLanguages.length > 0 && (
              <span>
                Langue(s) : <strong className="text-foreground">{diagnostic.preferredLanguages.join(', ')}</strong>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mentors recommandés issus du matching */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-foreground">
              Mentors recommandés pour vous ({recommendations.length})
            </h3>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/beneficiary/mentors" className="flex items-center gap-1">
              Explorer tous les mentors
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((match) => {
              const mentor = match.mentorProfile;
              const mentorName = mentor?.user?.profile
                ? `${mentor.user.profile.firstName} ${mentor.user.profile.lastName}`
                : 'Mentor ACCEENT';
              const jobTitle = mentor?.jobTitle || 'Expert Mentor';
              const org = mentor?.organization;
              const score = Math.round(match.totalScore);

              return (
                <Card key={match.id} className="shadow-xs hover:border-brand-primary/40 transition-all flex flex-col justify-between">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-base flex items-center justify-center shrink-0">
                          {mentorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground hover:text-brand-primary transition-colors">
                            {mentorName}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {[jobTitle, org].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                      </div>

                      {/* Score de compatibilité */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {score}% affinité
                        </div>
                      </div>
                    </div>

                    {/* Justification de matching */}
                    <p className="text-xs text-muted-foreground/90 bg-muted/40 p-2.5 rounded-md leading-relaxed border border-border/50">
                      💡 {match.justification}
                    </p>

                    {/* Expertises du mentor */}
                    {mentor?.expertises && mentor.expertises.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertises.slice(0, 4).map((exp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <div className="p-4 pt-0 border-t border-border/40 mt-auto flex items-center justify-between gap-2">
                    <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                      <Link href={`/beneficiary/mentors/${mentor?.id}`}>
                        Voir le profil
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                      <Link href={`/beneficiary/mentors/${mentor?.id}`}>
                        Solliciter ce mentor
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-semibold text-foreground">
              Recherche de mentors en cours...
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Nos algorithmes traitent vos critères. Vous pouvez consulter l'ensemble des mentors disponibles dès maintenant.
            </p>
            <Button asChild size="sm" className="mt-4 bg-brand-primary text-white text-xs">
              <Link href="/beneficiary/mentors">Voir le catalogue des mentors</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

