'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MentorFilterBarProps {
  onSearchChange: (search: string) => void;
  onSectorChange: (sector: string) => void;
  selectedSector: string;
}

export function MentorFilterBar({
  onSearchChange,
  onSectorChange,
  selectedSector,
}: MentorFilterBarProps) {
  const sectors = [
    'Tous les secteurs',
    'Tech & Digital',
    'Entrepreneuriat',
    'Finance & Fintech',
    'Agrobusiness',
    'Santé',
    'Marketing & Com',
  ];

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, compétence, mot-clé..."
            className="pl-9 bg-background"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Tags de filtre par secteur */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground shrink-0 font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Secteur :
        </span>
        {sectors.map((sec) => {
          const isSelected = selectedSector === sec || (sec === 'Tous les secteurs' && !selectedSector);
          return (
            <button
              key={sec}
              onClick={() => onSectorChange(sec === 'Tous les secteurs' ? '' : sec)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-brand-primary text-white border-brand-primary font-medium'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border-transparent'
              }`}
            >
              {sec}
            </button>
          );
        })}
      </div>
    </div>
  );
}

