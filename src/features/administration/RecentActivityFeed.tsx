import {
  UserPlus,
  Compass,
  CheckCircle,
  Briefcase,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { RecentAdminActivity } from "@/types";

interface RecentActivityFeedProps {
  activities: RecentAdminActivity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getIcon = (type: RecentAdminActivity["type"]) => {
    switch (type) {
      case "mentor_applied":
        return <UserPlus className="h-4 w-4 text-accent" />;
      case "session_held":
        return <Calendar className="h-4 w-4 text-emerald-600" />;
      case "user_registered":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "mentor_approved":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case "opportunity_published":
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      default:
        return <Compass className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-base font-bold text-foreground">
          Journal d&apos;Activités Récentes
        </h3>
        <span className="text-xs text-muted-foreground font-medium">Temps réel</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Aucune activité enregistrée récemment.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground truncate">
                    {act.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
