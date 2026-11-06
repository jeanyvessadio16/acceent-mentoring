import React from 'react';
import Link from 'next/link';
import { MentorProfile } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

interface MentorCardProps {
  mentor: MentorProfile;
  baseHref?: string;
  matchScore?: number;
  matchJustification?: string;
}

export function MentorCard({
  mentor,
  baseHref = '/mentors',
  matchScore,
  matchJustification,
}: MentorCardProps) {
  const isHighMatch = matchScore !== undefined && matchScore >= 80;

  return (
    <Card
      className={`hover:border-brand-primary/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
        isHighMatch ? 'border-emerald-300/80 bg-linear-to-b from-emerald-50/20 via-transparent to-transparent' : ''
      }`}
    >
      <CardHeader className="pb-3">
        {matchScore !== undefined && (
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Recommandation matching
            </span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
              {Math.round(matchScore)}% affinité
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-base border border-brand-primary/20 shrink-0">
              {(mentor.firstName?.[0] || 'M').toUpperCase()}
              {(mentor.lastName?.[0] || '').toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground leading-tight">
                {mentor.firstName} {mentor.lastName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{mentor.title}</p>
              {mentor.company && (
                <p className="text-xs font-medium text-brand-secondary">{mentor.company}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{mentor.rating.toFixed(1)}</span>
            <span className="text-[10px] text-amber-600/80">({mentor.reviewCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {matchJustification ? (
          <p className="text-xs text-foreground/90 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-md leading-relaxed">
            💡 <span className="font-medium text-emerald-950">{matchJustification}</span>
          </p>
        ) : mentor.bio ? (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{mentor.city ? `${mentor.city}, ${mentor.country}` : mentor.country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{mentor.experienceYears} ans d'exp.</span>
          </div>
        </div>

        {/* Compétences / Expertises */}
        <div className="flex flex-wrap gap-1 pt-1">
          {mentor.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[11px] font-normal py-0">
              {skill}
            </Badge>
          ))}
          {mentor.skills.length > 3 && (
            <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
              +{mentor.skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {mentor.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponible
            </span>
          ) : (
            <span className="text-muted-foreground">Indisponible</span>
          )}
        </span>
        <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-secondary text-white text-xs">
          <Link href={`${baseHref}/${mentor.id}`}>
            {matchScore !== undefined ? 'Voir & Solliciter' : 'Voir le profil'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
