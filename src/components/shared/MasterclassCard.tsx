'use client';

import React from 'react';
import Link from 'next/link';
import { MasterclassItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, PlayCircle } from 'lucide-react';

interface MasterclassCardProps {
  masterclass: MasterclassItem;
}

export function MasterclassCard({ masterclass }: MasterclassCardProps) {
  const isPast = masterclass.scheduledAt.startsWith('2025');

  return (
    <Card className="hover:border-brand-primary/50 transition-all duration-200 flex flex-col justify-between shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-brand-primary border-brand-primary/30">
            {masterclass.category}
          </Badge>
          {isPast ? (
            <Badge variant="secondary" className="text-[10px]">Replay disponible</Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">À venir</Badge>
          )}
        </div>
        <h3 className="font-semibold text-base text-foreground mt-2 line-clamp-1">
          {masterclass.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Par <span className="font-medium text-foreground">{masterclass.speakerName}</span> — {masterclass.speakerRole}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {masterclass.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>{masterclass.scheduledAt.slice(0, 10)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>{masterclass.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>{masterclass.participantCount} inscrits</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between">
        {isPast ? (
          <Button asChild size="sm" variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
            <Link href={`/masterclasses/${masterclass.id}`}>
              <PlayCircle className="w-3.5 h-3.5 text-brand-primary" />
              Visionner le replay
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs">
            <Link href={`/masterclasses/${masterclass.id}`}>
              S'inscrire à la session
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

