import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MentoringRequestStatus, AccountStatus } from '@/types';

interface StatusBadgeProps {
  status: MentoringRequestStatus | AccountStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente', className: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'ACCEPTED':
      case 'ACTIVE':
      case 'APPROVED':
        return { label: 'Accepté / Actif', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'REJECTED':
        return { label: 'Refusé', className: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'CANCELLED':
        return { label: 'Annulé', className: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'COMPLETED':
        return { label: 'Terminé', className: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'SUSPENDED':
        return { label: 'Suspendu', className: 'bg-orange-100 text-orange-800 border-orange-200' };
      default:
        return { label: status, className: 'bg-muted text-muted-foreground' };
    }
  };

  const config = getBadgeConfig();

  return (
    <Badge variant="outline" className={`text-[10px] font-semibold border ${config.className}`}>
      {config.label}
    </Badge>
  );
}

