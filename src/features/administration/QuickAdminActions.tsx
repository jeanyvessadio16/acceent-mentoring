import Link from "next/link";
import {
  FileSpreadsheet,
  PlusCircle,
  GraduationCap,
  Briefcase,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function QuickAdminActions() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs p-5 space-y-4">
      <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
        Actions Rapides Administrateur
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={ROUTES.ADMIN.OPPORTUNITIES}
          className="p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Publier une opportunité</p>
            <p className="text-[11px] text-muted-foreground">Emploi, bourse ou financement</p>
          </div>
        </Link>

        <Link
          href={ROUTES.ADMIN.MASTERCLASSES}
          className="p-3 rounded-xl border border-border hover:border-secondary/40 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Planifier une masterclass</p>
            <p className="text-[11px] text-muted-foreground">Webinaire ou atelier collectif</p>
          </div>
        </Link>

        <Link
          href={ROUTES.ADMIN.ANALYTICS}
          className="p-3 rounded-xl border border-border hover:border-accent/40 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-slate-900 transition-colors">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Exporter rapport d&apos;impact</p>
            <p className="text-[11px] text-muted-foreground">Données parité & insertion</p>
          </div>
        </Link>

        <Link
          href={ROUTES.ADMIN.VALIDATIONS}
          className="p-3 rounded-xl border border-border hover:border-emerald-300 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
        >
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Gérer les validations</p>
            <p className="text-[11px] text-muted-foreground">Modération des mentors</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
