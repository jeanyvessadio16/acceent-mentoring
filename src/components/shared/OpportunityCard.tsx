'use client';

import React from 'react';
import Link from 'next/link';
import { OpportunityItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building, ArrowUpRight } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: OpportunityItem;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const getCategoryColor = (category: OpportunityItem['category']) => {
    switch (category) {
      case 'EMPLOI':
        return 'bg-blue-100 text-blue-800';
      case 'STAGE':
        return 'bg-emerald-100 text-emerald-800';
      case 'FORMATION':
        return 'bg-purple-100 text-purple-800';
      case 'BOURSE':
      case 'FINANCEMENT':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="hover:border-brand-primary/50 transition-all duration-200 flex flex-col justify-between shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={`text-[10px] font-semibold uppercase ${getCategoryColor(opportunity.category)}`}>
            {opportunity.category}
          </Badge>
          {opportunity.isExpired && (
            <Badge variant="destructive" className="text-[10px]">Expiré</Badge>
          )}
        </div>
        <h3 className="font-semibold text-base text-foreground mt-2 line-clamp-1">
          {opportunity.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{opportunity.organization}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-brand-primary">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date limite : {opportunity.deadline}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50 flex justify-end">
        <Button asChild size="sm" variant="outline" className="text-xs hover:text-brand-primary">
          <Link href={`/opportunites/${opportunity.id}`} className="flex items-center gap-1">
            Détails de l'offre
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

