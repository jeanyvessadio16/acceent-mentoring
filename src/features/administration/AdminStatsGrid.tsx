import {
  Users,
  UserCheck,
  Compass,
  Award,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { AdminDashboardStats } from "@/types";

interface AdminStatsGridProps {
  stats: AdminDashboardStats;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const statCards = [
    {
      title: "Utilisateurs Inscrits",
      value: stats.totalUsers.toLocaleString("fr-FR"),
      subtitle: `${stats.totalBeneficiaries} bénéficiaires · ${stats.totalMentors} mentors`,
      icon: Users,
      trend: `${stats.totalPartners} partenaire(s)`,
      trendUp: true,
      color: "text-primary",
      bgLight: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      title: "Validations en Attente",
      value: stats.pendingValidations.toString(),
      subtitle: "Candidatures mentors & experts à traiter",
      icon: UserCheck,
      trend: stats.pendingValidations > 0 ? "Action requise" : "À jour",
      trendUp: false,
      isAlert: stats.pendingValidations > 0,
      color: "text-accent",
      bgLight: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      title: "Parcours Actifs",
      value: stats.activePrograms.toString(),
      subtitle: "Binômes mentor / mentoré en suivi",
      icon: Compass,
      trend: stats.activePrograms > 0 ? "En cours" : "Aucun actif",
      trendUp: stats.activePrograms > 0,
      color: "text-secondary",
      bgLight: "bg-secondary/10",
      borderColor: "border-secondary/20",
    },
    {
      title: "Sessions Réalisées",
      value: stats.completedSessions.toString(),
      subtitle:
        stats.satisfactionRate > 0
          ? `${stats.satisfactionRate}% de satisfaction moyenne`
          : "Aucune évaluation enregistrée",
      icon: Award,
      trend: stats.completedSessions > 0 ? "Sessions terminées" : "Aucune session",
      trendUp: stats.completedSessions > 0,
      color: "text-emerald-600",
      bgLight: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{card.subtitle}</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
                  card.isAlert
                    ? "text-accent"
                    : card.trendUp
                    ? "text-secondary"
                    : "text-muted-foreground"
                }`}
              >
                {card.isAlert ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
