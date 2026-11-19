import {
  Users,
  Calendar,
  Compass,
  Award,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { BeneficiaryDashboardData } from "@/types";

interface BeneficiaryStatsGridProps {
  data: BeneficiaryDashboardData;
}

export function BeneficiaryStatsGrid({ data }: BeneficiaryStatsGridProps) {
  const cards = [
    {
      title: "Mentors Actifs",
      value: data.activeProgramsCount.toString(),
      subtitle: data.activeProgramsCount > 0 ? "Accompagnement en cours" : "Aucun mentor actif",
      icon: Users,
      color: "text-secondary",
      bgLight: "bg-secondary/10",
    },
    {
      title: "Sessions Planifiées",
      value: data.upcomingSessionsCount.toString(),
      subtitle: data.upcomingSessionsCount > 0 ? "Rendez-vous à venir" : "Aucune session planifiée",
      icon: Calendar,
      color: "text-primary",
      bgLight: "bg-primary/10",
    },
    {
      title: "Progression du Parcours",
      value: `${data.averageProgress}%`,
      subtitle: data.activeProgram ? data.activeProgram.titre : "En attente de démarrage",
      icon: Compass,
      color: "text-accent",
      bgLight: "bg-accent/10",
      isProgress: true,
      progressValue: data.averageProgress,
    },
    {
      title: "Sessions Réalisées",
      value: data.completedSessionsCount.toString(),
      subtitle: "Heures de mentoring validées",
      icon: Award,
      color: "text-emerald-600",
      bgLight: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgLight} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              {card.isProgress && (
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-secondary h-full transition-all duration-500"
                    style={{ width: `${card.progressValue}%` }}
                  />
                </div>
              )}
              <span className="text-muted-foreground truncate block">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
