import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="shadow-xs">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-bold text-foreground">{value}</h4>
          {(description || trend) && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {trend && <span className="text-emerald-600 font-semibold">{trend}</span>}
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

